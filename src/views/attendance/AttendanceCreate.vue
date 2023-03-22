<script setup>
import Form from "vform";
import authService from "@@/services/AuthService";
import { useFlash } from "@@/composables/useFlash";
import { computed, ref } from "vue";

const { flash } = useFlash();

const data = ref({
  time: "",
  date: "",
  checkIn: null,
  checkOut: null,
  startTime: null, 
  endTime: null, 
  workingHours: null, 
});

var week = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
var timerID = setInterval(updateTime, 1000);
updateTime();

function updateTime() {
  var cd = new Date();
  data.value.time =
    zeroPadding(cd.getHours(), 2) +
    ":" +
    zeroPadding(cd.getMinutes(), 2) +
    ":" +
    zeroPadding(cd.getSeconds(), 2);
  data.value.date =
    zeroPadding(cd.getDate(), 2) +
    "/" +
    zeroPadding(cd.getMonth() + 1, 2) +
    "/" +
    zeroPadding(cd.getFullYear(), 4) +
    " " +
    week[cd.getDay()];
}

function zeroPadding(num, digit) {
  var zero = "";
  for (var i = 0; i < digit; i++) {
    zero += "0";
  }
  return (zero + num).slice(-digit);
}

const handleMarkAttendance = async () => {
  if (data.value.checkIn === null) {
    data.value.startTime = new Date().getTime();
    data.value.checkIn = data.value.time;
  } else {
    data.value.endTime = new Date().getTime();
    data.value.checkOut = data.value.time;
    data.value.workingHours = data.value.endTime - data.value.startTime ;
  }
};

const isCheckedIn = computed(() =>
  data.value.checkIn !== null ? true : false
);
const isCheckedOut = computed(() =>
  data.value.checkOut !== null ? true : false
);

const checkedInTime = computed(() =>
  data.value.checkIn !== null ? data.value.checkIn : "..:.."
);
const checkedOutTime = computed(() =>
  data.value.checkOut !== null ? data.value.checkOut : "..:.."
);
</script>

<template>
  <div class="text-center">
    <img
      src="/src/assets/img/pharmasquare-logo.png"
      class="img-fluid"
      width="250"
    />
  </div>
  <div id="clock" class="text-center mt-5">
    <p class="date">{{ data.date }}</p>
    <p class="time">{{ data.time }}</p>
  </div>
  <div class="text-center">
    <button 
    :disabled="isCheckedOut"
      class="mark-button"
      :class="isCheckedIn ? 'check-out' : 'check-in'"
      @click="handleMarkAttendance"
    >
      <i class="fa fa-hand-pointer-o d-block fa-4x mb-3" aria-hidden="true"></i>
      <span v-text="isCheckedIn ? 'Check Out' : 'Check In'"></span>
    </button>
  </div>
  <div class="row text-center mt-5">
    <div class="col">
      <i class="fa fa-clock-o fa-2x text-primary" aria-hidden="true"></i>
      <p>
        <span class="d-block marked-time" v-text="checkedInTime"></span>
        <small class="marked-time-label">Check In</small>
      </p>
    </div>
    <div class="col">
      <i class="fa fa-clock-o fa-2x text-primary" aria-hidden="true"></i>
      <p>
        <span class="d-block marked-time" v-text="checkedOutTime"></span>
        <small class="marked-time-label">Check Out</small>
      </p>
    </div>
    <div class="col">
      <i class="fa fa-clock-o fa-2x text-primary" aria-hidden="true"></i>
      <p>
        <span class="d-block marked-time">--:--</span>
        <small class="marked-time-label">Working Hours</small>
      </p>
    </div>
  </div>
</template>

<style scoped>
#clock .date {
  font-size: 30px;
  color: #727982;
  letter-spacing: 3px;
  font-weight: bold;
}
#clock .time {
  font-size: 50px;
  color: #414a59;
  letter-spacing: 3px;
  font-weight: bold;
}
.mark-button {
  width: 200px;
  height: 200px;
  border-radius: 100%;
  border: none;
  color: #fff;
}
.mark-button.check-in {
  background-color: #405ec0;
}
.mark-button.check-out {
  background-color: red;
}
.mark-button span {
  font-size: 20px;
}
.marked-time {
  font-size: 20px;
  font-weight: bold;
}
.marked-time-label {
  font-size: 16px;
}
button:disabled {
    background-color: #ccc !important;
    cursor: not-allowed;
}
</style>
