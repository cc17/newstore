# -*- coding: utf8 -*-
#!env python
import subprocess
import os
import codecs
import re
import datetime
import time

now = str(int(time.mktime(datetime.datetime.now().timetuple())))

#压缩html
targets = ['index', 'top', 'cat', 'search','subject']
for target in targets:

    
    file = os.path.abspath(target+'-dev.html')
    outeFile = os.path.abspath( target+'.html')
    fp = codecs.open(file, 'r', 'UTF-8')
    outFp = codecs.open(outeFile, 'w+', 'UTF-8')
    content = fp.read()
    
    
    content = re.sub(r'href="src/css/(.*)\.css"','href="src/css/\g<1>.min.css?t=' + now + '"',content)
    content = re.sub(r'src="(.*)\.js"','src="\g<1>.min.js?t=' + now + '"',content)
    #去除html空格
    #content = re.sub(r'\s*\r?\n\s*', '', content)
    #content = re.sub(r'<!--.*?-->', '', content)
    #替换导航
    content = re.sub(r'"(.*?)-dev\.html"','"\g<1>.html"',content)
    
    outFp.write(content)
    fp.close()
    outFp.close()
