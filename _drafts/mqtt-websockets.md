mqtt-websockets.md

python-paho-mqtt:
pybuild

If you want use mosquitto with web app, you may need websockets supports.
Update to mosquitto 1.4 above.
How to:
http://www.eclipse.org/mosquitto/download/#linux
-> http://mosquitto.org/2013/01/mosquitto-debian-repository/
add deb repo of mosquitto.

setting:
http://www.xappsoftware.com/wordpress/2015/05/18/six-steps-to-install-mosquitto-1-4-2-with-websockets-on-debian-wheezy/

/etc/mosquitto/mosquitto.conf
---
# for the default listener
port 1883

# for the websockets
listener 9001 127.0.0.1
protocol websockets
---

setting manual: http://www.eclipse.org/mosquitto/man/mosquitto-conf-5.php

* [Python paho-mqtt](https://pypi.python.org/pypi/paho-mqtt)

