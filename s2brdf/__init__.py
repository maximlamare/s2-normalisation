import logging
import os
import random

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s')
# silence the unimportant boto logging
logging.getLogger('boto3').setLevel(logging.CRITICAL)
logging.getLogger('botocore').setLevel(logging.CRITICAL)
logging.getLogger('s3transfer').setLevel(logging.CRITICAL)
logging.getLogger('urllib3').setLevel(logging.CRITICAL)
logging.getLogger('azure').setLevel(logging.WARNING)


if 'RANDOM_SEED' in os.environ:
    seed = int(os.environ['RANDOM_SEED'])
    logging.info('Using random seed = {}'.format(seed))
    random.seed(seed)
