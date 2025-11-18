#!/bin/bash

echo "Build script"

cd ../client
npm install

cd ../backend

npm run build