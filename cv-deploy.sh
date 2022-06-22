#!/bin/bash
package_name=$1
temp_directory=tmp_webbwebbwebb_deployment
target_directory=webbwebbwebb.co.uk
backup_directory=backup-webbwebbwebb-$(date +%Y-%m-%d-%H-%M-%S)

echo Cleaning temp directory
rm -rf $temp_directory
mkdir $temp_directory

echo Extracting "$package_name" to "$temp_directory"
tar -C "$temp_directory" -xvf "$package_name"

echo Copying "$target_directory" to "$backup_directory"
rm -rf "$backup_directory"
mkdir "$backup_directory"
cp -pr "$target_directory"/** "$backup_directory"/

echo Cleaning "$target_directory"
find "$target_directory"  -maxdepth 1 ! -name .htaccess -type f -delete -print

echo Updating "$target_directory" with contents of "$temp_directory"
cp -r "$temp_directory"/** "$target_directory"/