echo 'Building...'
yarn build

echo 'Creating git repo...'
cd site/
git init
git add -A
git commit -m "."

echo 'Deploying...'
git remote add dokku dokku@jakerunzer.com:brain
git push dokku master --force

cd ..
