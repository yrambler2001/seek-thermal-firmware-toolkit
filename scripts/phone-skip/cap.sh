#!/bin/zsh
# cap.sh <name> <seconds> [prop]: set debug.seekprobe on the phone (SERIAL=<adb serial>), stream the SeekProbe log for N s into ./<name>.log next to this script, analyse it with probe.py
S=${SERIAL:-192.168.1.73:5555}; R=${0:a:h}
adb -s $S shell "setprop debug.seekprobe '$3'"
sleep 2
adb -s $S logcat -c
adb -s $S logcat -v epoch -s SeekProbe:I > $R/$1.log &
LP=$!
sleep $2
kill $LP
echo "== $1 (prop '$3')"; python3 $R/probe.py $R/$1.log
