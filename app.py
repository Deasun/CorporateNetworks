from flask import Flask, request, render_template, redirect, jsonify, url_for, session
from flask_pymongo import PyMongo
from models import Company, Officer, Company_Network, News_Updates
from tasks import officer_data, source_co, linked_co
from pprint import pprint
import aiohttp
from aiohttp import ClientSession
import asyncio
import json
import requests
import os
import datetime

app = Flask(__name__)

""" Configuration Variables for Development """
app.config.from_pyfile('dev_config.py')

""" Configuration Variables for Production """
# app.config.from_pyfile('config.py')

mongo = PyMongo(app)

# Async Tasks
loop = asyncio.get_event_loop()


@app.route('/', methods=['GET', 'POST'])
def home():

	date = str(datetime.datetime.utcnow())
	cal_date = slice(0,10)
	query = { 'date' : date[cal_date]}

	# Update news from Corporate Watch daily 
	if mongo.db.netcorp.count_documents(query):
		data = mongo.db.netcorp.find_one({'_id' : 'cw_news' })		
		headlines = data['news']

		return render_template('home.html', headlines=headlines)
	
	else:
		coporate_watch = News_Updates(
			'https://corporatewatch.org/',
			'front-view-title'
		)
		# Scrape Corporate Watch for latest news and store in database
		headlines = coporate_watch.update_news()

		mongo.db.netcorp.find_one_and_replace(
			{ '_id' : 'cw_news' }, 
			{ 'news' : headlines, 'date': date[cal_date] }, upsert=True)
		
		data = mongo.db.netcorp.find_one({'_id' : 'cw_news' })		
		
		headlines = data['news']
		print("Corporate Watch news updated")

		return render_template('home.html', headlines=headlines)


"""
Check if Company Network currently exists in the database.
"""
@app.route('/check_database', methods=['POST', 'GET'])
def check_database():

	if request.method == 'POST':
		company_id = request.form['company_number'].upper().replace(" ","")
		# Store company_id in session
		session['company_id'] = company_id
		
		# Skip API calls if Company Network is in the database
		if mongo.db.netcorp.count_documents({'Companies': {'$in': [company_id]}}, limit=1):
			print(company_id + " exists in database search history")
			
			return redirect(url_for('chart_data', company_id=company_id))			

		else:
			
			return redirect(url_for('source_data', company_id=company_id))


"""
If Company Network does not exist in the database, run
the API requests for the source company
"""
@app.route('/source_data/<company_id>')	
def source_data(company_id):

	try:
		company_network = []

		urls = [
			'https://api.opencorporates.com/v0.4/companies/gb/' + company_id + '?api_token=' + app.config.get('OC_KEY'),
			'https://' + app.config.get('CH_KEY') + ':@api.companieshouse.gov.uk/company/' + company_id + '/officers',
			'https://' + app.config.get('CH_KEY') + ':@api.companieshouse.gov.uk/company/' + company_id + '/charges'
		]

		source_company = loop.run_until_complete(source_co(urls))

		if source_company['status'] == 'Dissolved':
			error_message = source_company['name'] + " are registered as 'Dissolved'."	

			return render_template('home.html', error=error_message)

		else:
			company_network.append(source_company)

			# Get Linked Companies
			for officer in source_company['officer_ids']:

				# Officer API call
				url = 'https://' + app.config.get('CH_KEY') + ':@api.companieshouse.gov.uk/officers/' + officer + '/appointments'
				officer_companies = loop.run_until_complete(officer_data(url))

				source_officer = Officer(officer, officer_companies)
				companies = source_officer.companies()
			
				# API calls for Linked Companies
				for company in companies:
					urls = [
						'https://api.opencorporates.com/v0.4/companies/gb/' + company + '?api_token=' + app.config.get('OC_KEY'),
						'https://' + app.config.get('CH_KEY') + ':@api.companieshouse.gov.uk/company/' + company + '/officers',
						'https://' + app.config.get('CH_KEY') + ':@api.companieshouse.gov.uk/company/' + company + '/charges'
					]

					linked_companies = loop.run_until_complete(linked_co(urls, company_network))
				
				companies_combined = company_network + linked_companies

			company_list = Company_Network(companies_combined)
			chart_data = company_list.nodes_links()

			# Insert Companies into Database
			link_companies = []

			for company in chart_data['nodes']:
				# Replace Duplicates	
				mongo.db.netcorp.find_one_and_replace(
					{ '_id' : company['_id'] }, company, upsert=True)

				link_companies.append(company['_id'])

			# Add Link Companies and Network Links to Searched Company Document
			links = chart_data['links']

			mongo.db.netcorp.find_one_and_update( 
				{'_id' : chart_data['nodes'][0]['_id']}, 
				{'$set': { 'network_links' : links }},
			)
			
			mongo.db.netcorp.find_one_and_update( 
				{'_id' : chart_data['nodes'][0]['_id']}, 
				{'$set': { 'link_companies' : link_companies }},
			)

			# Update Search History
			mongo.db.netcorp.find_one_and_update( 
				{'_id' : 'Search History'}, 
				{'$push': { 'Companies' : company_id }},
				upsert=True
			)

			return redirect(url_for('chart_data', company_id=company_id))

	except KeyError:
		error_message = "Please enter a valid Company House ID number."	

		return render_template('home.html', error=error_message)


"""
Read data from database and render Company Network
"""
@app.route('/chart_data/<company_id>')
def chart_data(company_id):

	print('Redirect received')
	print(company_id)

	# d3 Network Chart Data
	chart_data = {}
	nodes = []
	links = []

	# Get Nodes
	core_company = mongo.db.netcorp.find_one({'_id' : company_id })

	for co_id in core_company['link_companies']:
		linked_company = mongo.db.netcorp.find_one({'_id' : co_id })

		# Remove duplicates
		if linked_company not in nodes:
			nodes.append(linked_company)

	# Get Links
	for link in core_company['network_links']:
		links.append(link)

	chart_data['nodes'] = nodes
	chart_data['links'] = links

	data = {'chart_data' : chart_data}

	return render_template('chart.html', data=data)


@app.route('/dig-deeper', methods=['GET'])
def dig_deeper():

	return render_template('dig-deeper.html')
		


if __name__ == '__main__':
	app.run(debug=app.config.get('DEBUG'), 
			host=app.config.get('IP'), 
			port=app.config.get('PORT'),
			)
