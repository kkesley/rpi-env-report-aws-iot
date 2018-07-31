from sense_hat import SenseHat
import os
import time

class Reading:
    def __init__(self):
        self.sense = SenseHat()
        self.sense.clear()
    
    def getReading(self):
        t1 = self.sense.get_temperature_from_humidity()
        t2 = self.sense.get_temperature_from_pressure()
        t_cpu = self.get_cpu_temp()
        t = (t1+t2)/2
        t_corr = t - ((t_cpu-t)/1.5)
        t_corr = self.get_smooth(t_corr)
        humidity = self.sense.get_humidity()
        pressure = self.sense.get_pressure()
        return {
            "deviceid": self.getserial(),
            "humidity": humidity,
            "pressure": pressure,
            "temperature": t_corr,
            "timestamp": int(round(time.time() * 1000)),
        }

    # code supplied from http://yaab-arduino.blogspot.com/2016/08/accurate-temperature-reading-sensehat.html
    # get CPU temperature
    def get_cpu_temp(self):
        res = os.popen("vcgencmd measure_temp").readline()
        t = float(res.replace("temp=","").replace("'C\n",""))
        return(t)

    # use moving average to smooth readings
    def get_smooth(self, x):
        smoothing = [x,x,x]
        smoothing[2] =smoothing[1]
        smoothing[1] = smoothing[0]
        smoothing[0] = x
        xs = (smoothing[0]+smoothing[1]+smoothing[2])/3
        return(xs)

    def getserial(self):
        # Extract serial from cpuinfo file
        cpuserial = "0000000000000000"
        try:
            f = open('/proc/cpuinfo','r')
            for line in f:
                if line[0:6]=='Serial':
                    cpuserial = line[10:26]
            f.close()
        except:
            cpuserial = "ERROR000000000"
        
        return cpuserial