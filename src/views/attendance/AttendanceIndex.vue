<script setup>
// import authService from "@@/services/AuthService";
import { computed, ref, onMounted } from "vue";

const attendanceData = ref([]);

const getAttendanceData = () => {
    //
    attendanceData.value = [];
}

onMounted(() => {
    getAttendanceData();
})

</script>

<template>
<Panel>
    <template #header>
        <h1 class="h3 mb-0 text-middle">Attendance</h1>
    </template>
    <div class="table-responsive">
        <table class="card-1 mb-0 table table-bordered table-hover table-striped">
            <thead class="bg-primary text-bg-dark">
                <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hrs</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>Salman</td>
                    <td>11/22/2022</td>
                    <td>09:05</td>
                    <td>06:15</td>
                    <td>09:10</td>
                    <td><span class="badge bg-success">Present</span></td>
                </tr>
                <tr>
                    <td>2</td>
                    <td>Saifullah</td>
                    <td>11/22/2022</td>
                    <td>..:..</td>
                    <td>..:..</td>
                    <td>..:..</td>
                    <td><span class="badge bg-danger">Absent</span></td>
                </tr>
            </tbody>
        </table>
    </div>
</Panel>
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
