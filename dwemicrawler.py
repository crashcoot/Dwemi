from icrawler.builtin import GoogleImageCrawler
from icrawler import ImageDownloader
import os
import sys
import random

if os.path.exists("html/images/stomachImages/stomach.jpg"):
  os.remove("html/images/stomachImages/stomach.jpg")

class PrefixNameDownloader(ImageDownloader):
    def get_filename(self, task, default_ext):
        return "stomach.jpg"

dimensions = [
    [640,480],
    [720,348],
    [1024,768],
    [1280,1024],
    [1366, 768],
    [1600, 1200],
    [1680, 1050],
    [1680,1050],
    [1920,1200]
]
dimension = random.choice(dimensions)
google_crawler = GoogleImageCrawler(
    downloader_cls=PrefixNameDownloader,
    storage={'root_dir': 'html\images\stomachimages'})

filters = dict(size=f"={dimension[0]}x{dimension[1]}")
google_crawler.crawl(sys.argv[1],filters=filters, max_num=1)