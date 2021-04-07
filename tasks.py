from flask import session
import aiohttp
from aiohttp import ClientSession
import asyncio
import json
from models import Company

"""
async API calls
"""

#  Get a single url
async def fetch(aio_session, url):
	async with aio_session.get(url) as response:
		print(url)
		if response.status != 200:
			pass
		return await response.json()

# Get a list of urls
async def fetch_all(aio_session, urls):
    results = await asyncio.gather(*[asyncio.create_task(fetch(aio_session, url))
                                   for url in urls])
    return results

# Get officer data
async def officer_data(url):
	async with aiohttp.ClientSession() as aio_session:
		json_response = await fetch(aio_session, url)

	return json_response

#  Get source company data
async def source_co(urls):
	async with aiohttp.ClientSession() as aio_session:
		json_response = await fetch_all(aio_session, urls)

		company = Company(
			json_response[0],
			json_response[1],
			json_response[2]
			)

		profile = company.profile()

		return profile

# Get linked company data
async def linked_co(urls, company_network):

	async with aiohttp.ClientSession() as aio_session:

		json_response = await fetch_all(aio_session, urls)

		company = Company(
			json_response[0],
			json_response[1],
			json_response[2]
			)

		profile = company.profile()

		company_network.append(profile) # filter out resigned

	return company_network
