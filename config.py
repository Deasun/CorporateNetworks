import os

# For Flask session cookies
SECRET_KEY=os.environ.get('SECRET_KEY')

# Database
MONGO_URI=os.environ.get('MONGO_URI')

# Companies House API Key
CH_KEY=os.environ.get('CH_KEY')

# Open Corporates API Key
OC_KEY=os.environ.get('OC_KEY')

DEBUG=os.environ.get('DEBUG')
IP=os.environ.get('IP')
PORT=os.environ.get('PORT')