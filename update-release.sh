#!/bin/bash

prepare () {
    echo "{\n\t\"release\":\"$1.$2.$3\"\n}" > frontend-sap/src/assets/release.json
    echo "export const  GENERAL_SETTING = {\n\t\"release\":\"$1.$2.$3\",\n\t\"copy_right\":\"© 2023 schertech\"\n}" > frontend/src/app/shared/setting/general-setting.ts
}

inc () {
    return $(($1+1))
}

#READING VERSION JSON STRING
var=$(cat frontend-sap/src/assets/release.json | cut -f2 -d ":" | grep \"202*.*.*\")

full1=$(echo "$var" | tr -d '"')
full2=$(echo "$var" | tr -d '"')
full3=$(echo "$var" | tr -d '"')


week_ver=$(echo "$full2" | cut -f2 -d "." )
year_ver=$(echo "$full1" | cut -f1 -d "." )
rel_ver=$(echo "$full3" | cut -f3 -d "." )

curr_y=$(date +"%Y")
curr_w=$(date +"%V")

if [ "$curr_y" = "$year_ver" ]
    then
        echo "Same Year"
        if [ "$curr_w" = "$week_ver" ]
        then
                echo "SAME WEEK"
                inc $rel_ver
                new_rel=$?

                prepare "$year_ver" "$curr_w" "$new_rel"
        else
                echo "Different Week"
                prepare "$year_ver" "$curr_w" "0"
        fi
else
        echo "Year Change"
        prepare "$curr_y" "$curr_w" "0"
fi
echo "------------------"
echo $year_ver
echo $week_ver
echo $rel_ver
echo $curr_y
echo $curr_w
