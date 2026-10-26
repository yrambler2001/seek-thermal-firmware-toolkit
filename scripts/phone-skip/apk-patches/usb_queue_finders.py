"""The camera library's frame read call shapes (shared by the usb experiments)."""
import re

from ..smali import REG

CONNECTION = "Landroid/hardware/usb/UsbDeviceConnection;"
REQUEST = "Landroid/hardware/usb/UsbRequest;"
QUEUE = REQUEST + "->queue(Ljava/nio/ByteBuffer;I)Z"
REQUEST_WAIT = CONNECTION + "->requestWait()" + REQUEST

FRAME_REQUEST_CALL = re.compile(r"^([ \t]*)invoke-virtual \{(" + REG + "), (" + REG + "), (" + REG + r")\}, (L[\w/$]+;)->([\w$]+)\("
                                + re.escape(CONNECTION) + r"I\)I$", re.M)
QUEUE_CALL = re.compile(r"^([ \t]*)invoke-virtual \{(" + REG + "), (" + REG + "), (" + REG + r")\}, " + re.escape(QUEUE) + "$", re.M)
WAIT_CALL = re.compile(r"^([ \t]*)invoke-virtual \{" + REG + r"\}, " + re.escape(REQUEST_WAIT) + r"\n"
                       r"(?:[ \t]*(?:\.line \d+)?\n)*[ \t]*move-result-object (" + REG + r")\n", re.M)
