import os
import re

DIR = '/Users/karandhiver/Developer/Sagarlad/demo/apps/site/src'

for root, _, files in os.walk(DIR):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r') as file:
                content = file.read()
            
            if 'py-24 md:py-32' in content:
                new_content = content.replace('py-24 md:py-32', 'py-16 md:py-24')
                with open(path, 'w') as file:
                    file.write(new_content)
                print(f"Updated {path}")
print("Done padding fix")
