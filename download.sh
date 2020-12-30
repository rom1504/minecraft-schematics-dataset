mkdir -p data && cd data
END=36
wget https://gitlab.com/rom1504/minecraft-schematics-dataset/-/raw/master/schematics/schematics_0.tfrecords
for i in $(seq 1 $END)
do
wget https://gitlab.com/rom1504/minecraft-schematics-dataset/-/raw/master/schematics/schematics_${i}000.tfrecords
done
wget https://gitlab.com/rom1504/minecraft-schematics-dataset/-/raw/master/schematicsWithFinalUrl.json
