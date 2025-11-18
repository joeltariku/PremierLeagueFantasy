#!/bin/bash

echo "Build script"

cd ../client
npm install

cd ../backend
npm install

npm run build