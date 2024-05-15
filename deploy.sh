echo "Removing all files from ../slapstuk/build"
rm -r ../slapstuk/build
echo "Copying files to ../slapstuk folder..."
cp -r ./build  ../slapstuk
echo "Running 'firebase deploy --only hosting' from ../slapstuk folder..."
pushd ../slapstuk
firebase use pixelars
firebase deploy --only hosting
popd
echo "Deploy to Slapstuk hosting done."
