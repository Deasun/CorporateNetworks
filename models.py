from pprint import pprint
import datetime
import json
import os
import requests
from bs4 import BeautifulSoup

""" 
The Company class takes the jsonified API responses (Companies House and 
OpenCorporates) as parameters

.profile() method calls the preceding methods to construct and return
the full Company Profile
"""
class Company:

	def __init__(self, oc_data, ch_data, oc_charges):
		self.oc_data = oc_data
		self.ch_data = ch_data
		self.oc_charges = oc_charges
		
 
	def industry(self):
		
		industries = []

		company_results = self.oc_data['results']['company']
		industry_names = company_results['industry_codes']
		
		for x in industry_names:
			industry =  x['industry_code']['description'] + ' (' + x['industry_code']['code_scheme_name'] + ')'
			industries.append(industry)
		
		return industries
	

	def finances(self):

		number = self.oc_data['results']['company']['company_number']
		company_results = self.oc_data['results']['company']['financial_summary']


		def get_company_financials(target, num, name):

			try:
				var = company_results[target][num]['value']
				return var

			except (TypeError, KeyError, IndexError) as error:
				print(number + ' : ' + name + str(error.args))
				var = 'N/A'	
				return var
		
		try: 
			profit = company_results['profit']
		
		except (TypeError, KeyError) as error:
			print(number + ' : ' + 'profit' + str(error.args))
			profit = 'N/A'


		finances = {
			'cash_at_bank_16': get_company_financials('cash_at_bank', 0, 'cash'),
			'cash_at_bank_15': get_company_financials('cash_at_bank', 1, 'cash'),
			'current_assets_16': get_company_financials('current_assets', 0, 'assets'),
			'current_assets_15': get_company_financials('current_assets', 1, 'assets'),
			'current_liabilities_16': get_company_financials('current_liabilities', 0, 'liabilities'),
			'current_liabilities_15': get_company_financials('current_liabilities', 1, 'liabilities'),
			'profit': profit
		}
		
		return finances


	def charges(self):

		total_charges = []
		
		try:

			for item in self.oc_charges['items']:
				charges_owed_to = []
				
				for creditor in item['persons_entitled']:
					name = creditor['name']
					charges_owed_to.append(name)
	
				try: 
					description = item['particulars']['description']

				except KeyError:
					description = 'No information provided'
				
				charges = {
					'persons_entitled': charges_owed_to,
					'type': item['classification']['description'],
					'status': item['status'],
					'descriptions': description,
					'created_on': item['created_on'],
				}

				total_charges.append(charges)

		except (AssertionError, KeyError):
			total_charges = "No charges listed."

		return total_charges


	# Create the Company Profile
	def profile(self):

		company_results = self.oc_data['results']['company']
		
		officer_info = self.ch_data['items']

		# filter out resigned officers
		active_officer_ids = []
		former_officer_ids = []

		active_officer_names = []
		former_officer_names = []

		for x in officer_info:
			if 'resigned_on' in x.keys():
				id_officer = x['links']['officer']['appointments'].replace('/officers/', '').replace('/appointments', '')
				former_officer_ids.append(id_officer)
				former_officer_names.append(x['name'])  

			else:
				id_officer = x['links']['officer']['appointments'].replace('/officers/', '').replace('/appointments', '')
				active_officer_ids.append(id_officer)
				active_officer_names.append(x['name'])
		
		company_profile = {
			'id': company_results['company_number'],
			'name': company_results['name'],
			'status': company_results['current_status'],
			'url': company_results['opencorporates_url'],
			'address': company_results['registered_address_in_full'],
			'officer_ids': active_officer_ids,
			'former_officer_ids': former_officer_ids,
			'industry' : self.industry(),
			'officer_names': active_officer_names,
			'former_officer_names': former_officer_names,
			'finances': self.finances(),
			'charges': self.charges()
		}

		return company_profile


"""
The Officer class takes the Officer ID and json list of companies
which the Director is/was a Director of as parameters.

The .companies() method filters out any companies the Director has resigned from
"""
class Officer:

	def __init__(self, officer_id, officer_cos):
		self.officer_id = officer_id
		self.officer_cos = officer_cos	
	
	def __repr___(self):
		return (f'{self.__class__.__name__}('f'{self.officer_id!r})')
	


	# Get list of Officer's current Companies 
	def companies(self):
		
		co_data = self.officer_cos['items']

		companies = []

		for co in co_data:

			if 'resigned_on' not in co.keys(): 

				companies.append(co['appointed_to']['company_number'])
	
		return companies


"""
The Comany_Network class takes a list of company profiles that 
are linked (through common directorships) to the source
Company as parameters.

.nodes_links() creates the nodes and links necessary to generate the 
d3 Network Chart 
"""
class Company_Network:
	def __init__(self, companies):
		
		self.companies = companies
	

	def nodes_links(self):

		nodes = []
		pre_links = []
		# Create Nodes
		for source_company in self.companies:
			
			# Get Financial Information With Exceptions for 'None' Value
			def get_financials(target):
				try:
					var = source_company['finances'][target]
					return var
				
				except(TypeError, KeyError):
					var = 'N/A'
					return var

			node = { 
				'_id': source_company['id'], 
				'name': source_company['name'],
				'address': source_company['address'],
				'assets_2016': get_financials('current_assets_16'),
				'assets_2015': get_financials('current_assets_15'),
				'cash_2016': get_financials('cash_at_bank_16'),
				'cash_2015': get_financials('cash_at_bank_15'),
				'liabilities_2016': get_financials('current_liabilities_16'),
				'liabilities_2015': get_financials('current_liabilities_15'),
				'status': source_company['status'],
				'officers': source_company['officer_names'],
				'profit': get_financials('profit'),
				'former_officers': source_company['former_officer_names'],
				'industry': source_company['industry'],
				'url': source_company['url'],
				'charges': source_company['charges'],
				'date_stamp': datetime.datetime.utcnow()
				}
			

			if node not in nodes: 
				print('New node: ' + node['_id'])
				nodes.append(node)

			else:
				print('Node ' + node['_id'] + ' already exists in chart data.')

			# Remove Duplicates from Source Officer List
			source_officers = list(dict.fromkeys(source_company['officer_ids']))
			# Start Loop From Second Element
			itercompany = iter(self.companies)			
			next(itercompany)

			for target_company in itercompany:
				# Remove Duplicates from Target Officer List
				target_officers = list(dict.fromkeys(target_company['officer_ids']))

				for officer in source_officers:

					if officer in target_officers and source_company['id'] != target_company['id']: # Remove Self-Referencing

						link = {
							'source': source_company['id'],
							'target': target_company['id']
						}
						# Remove duplicates
						if link not in pre_links:
							pre_links.append(link)
				
		# Create List of Active Companies
		# Use this List to Filter Out Dissolved Companies from Links
		companies = []
		links = []
		
		for node_id in nodes:

			if node_id['_id'] not in companies:
				companies.append(node_id['_id'])
				
		# Match Source and Targets List of Active Companies 
		for link_id in pre_links:
			
			if link_id['source'] not in companies:
				print("Link source redundant:")
				pprint(link_id)
				pass
				
			elif link_id['target'] not in companies:
				print("Link target redundant:")
				pprint(link_id)
				pass
				
			else:
				links.append(link_id) 				
				
		# Create Nodes and Links Object
		chart_data = { "nodes": nodes, "links": links } 

		return chart_data


"""
News_Updates class scrapes the Corporate Watch website for latest news once 
daily
"""
class News_Updates:

	def __init__(self, url, tag_headline):

		self.url = url
		self.tag_headline = tag_headline

	
	def update_news(self):

		get_url = requests.get(self.url)
		bs_html = BeautifulSoup(get_url.text, 'lxml')
		headline = bs_html.find_all(class_=self.tag_headline)

		stories = []
		for title in headline:
			news_links = {
				'text': title.text,
				'link': title.a['href'] 
			}

			stories.append(news_links)

		return stories

