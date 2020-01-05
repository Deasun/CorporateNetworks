# Corporate Networks
Connecting the dots between companies and the people who control them.

## Overview

### What is this application for?
Corporate Networks is a research tool for activists to explore the links between people and companies. It is intended to be a supplementary tool to the excellent resources already provided by OpenCorporates.com and Corporate Watch. 

By simply entering a company's UK Companies House ID, a user-friendly, manipulable Corporate Network Map is produced providing details on:
* directors within the company (**Company A**)
* other companies (**Companies B+**) who share directors with **Company A** and director information for **Companies B+**
* General information (address, industry, Companies House ID) for **Company A** and **Companies B+**
* Financial information submitted to UK Companies House (assets, liabilities, profits, charges). This information is sparse and dependent on the Companies House API. We have to work with the information provided. Useful links to OpenCorporates.com and Corporate Watch are embedded in the Corporate Network for users to explore finances, and company information in general, in more detail.

> When enabled, a **Company Network Helper** feature provides users with an overview of the information layout and site functionality. 

### How does it work?
The website is built on the [Flask](http://flask.palletsprojects.com/en/1.1.x/) microframework and written in **python 3.7.5**.

A [MongoDB](https://www.mongodb.com/) database is dynamically created, utilising the [pyMongo](https://api.mongodb.com/python/current/) distribution, and is populated based on user's search results. Information is accessed from both [Companies House API](https://developer.companieshouse.gov.uk/api/docs/) and the [OpenCorporates API](https://api.opencorporates.com/) based on the user's search request. The database prevents duplicate API calls being made by accessing search history in the first instance.

[AIOHTTP](https://aiohttp.readthedocs.io/en/stable/) for asyncio and Python is used to make asynchronous API calls.

The [D3](https://d3js.org/) javascript library is used to render the Network Chart. 

The application is styled using HTML, CSS, and JavaScript (inc JQuery). It was developed using Visual Studio Code (v1.41.1) and is hosted on the [Heroku](https://www.heroku.com/) mobile application platform.

### Development and Production
During development, store the following environment variables in a **dev_config.py** file (add to .gitignore) in the local directory:

* SECRET_KEY (required by Flask)
* MONGO_URI (provided by MongDB on database set-up)
* CH_KEY (your Companies House API Key)
* OC_KEY (your OpenCorporates API Key)
* IP='127.0.0.1'
* PORT='5000'
* DEBUG='True'

During production enviornment variables are set in Heroku Config Vars during production and debug is set to 'False'.

## Getting the code up and running
1. Create a virtual environment running python 3.7.5 as the default in your IDE
2. Clone this repository by running the git clone https://github.com/Deasun/snAPP.git command 
3. pip install requirements
4. Set your own environment variables for development mode as described in the Deployment section above. Save these in an dev_config.py file in your root directory. 
> In app.py file:
> Comment out **app.config.from_pyfile('config.py')**
> Uncomment **app.config.from_pyfile('dev_config.py')** 

5. The project will now run on localhost (http://127.0.0.1:5000/)

## Version 2.0
Key features to be improved include:
* sourcing more accurate and up to date financial information and/or presenting available information differently
