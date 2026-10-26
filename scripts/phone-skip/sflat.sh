#!/bin/sh
# sflat.sh <serial> <seconds> <out>: poll SurfaceFlinger --latency for the Seek SurfaceView every 1.5 s
S=$1; N=$2; OUT=$3
: > $OUT
end=$(( $(date +%s) + N ))
while [ $(date +%s) -lt $end ]; do
  adb -s $S shell 'dumpsys SurfaceFlinger --latency "SurfaceView - com.tyriansystems.SeekThermal.patched/com.tyriansystems.SeekThermal.MainActivity"' >> $OUT
  sleep 1.5
done
