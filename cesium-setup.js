Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4N2RkY2M3Ny00MTA2LTRmNjMtYjBkNS04NDdhNmVlMTBmZDQiLCJpZCI6NDcyNzcsImlhdCI6MTYxNzAzMTkzNn0.nQKrfRXx4K7qz8_FWBnS7EfE7Uj8Jhm49ReO508KGrc"
// Create a clock that loops on Christmas day 2013 and runs in real-time.
const startHour = 06
const initTime = new Date("2022-06-21T06:00:00.000+08:00")
initTime.setHours(startHour)
const endTime = new Date("2022-06-21T18:59:59.999+08:00")
const clock = new Cesium.Clock({
  startTime: Cesium.JulianDate.fromDate(initTime),
  currentTime: Cesium.JulianDate.fromDate(initTime),
  stopTime: Cesium.JulianDate.fromDate(endTime),
  clockRange: Cesium.ClockRange.LOOP_STOP,
  clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
})

const viewer = new Cesium.Viewer("cesiumContainer", {
  baseLayerPicker: true,
  vrButton: true,
  geocoder: false,
  navigationHelpButton: false,
  selectionIndicator: true,
  shadows: true,
  showOutline: true,
  timeline: true,
  sceneModePicker: true,
  clockViewModel: new Cesium.ClockViewModel(clock),
  infoBox: false,
})
// 修改時間條顯示文字
viewer.animation.viewModel.timeFormatter = function (date, viewModel) {
  date = Cesium.JulianDate.toDate(date)
  return date.toLocaleTimeString()
}
//讀取檔案並上色
const tileset = new Cesium.Cesium3DTileset({
  name: "taichung",
  url: "./tileset/tileset.json",
})

viewer.scene.primitives.add(tileset)

viewer.flyTo(tileset)
tileset.style = new Cesium.Cesium3DTileStyle({
  show: "${floor}>=0",
  color: {
    conditions: [
      // ["${cover} >= 90%", "rgb(26,152,80)"],
      // ["${cover} >= 80%", "rgb(102,189,99)"],
      // ["${cover} >= 70%", "rgb(166,217,106)"],
      // ["${cover} >= 60%", "rgb(217,239,139)"],
      // ["${cover} >= 50%", "rgb(254,224,139)"],
      // ["${cover} >= 40%", "rgb(253,174,97)"],
      // ["${cover} >= 20%", "rgb(245,92,0)"],
      ["true", "rgb(53, 255, 255)"],
    ],
  },
})

const infoboxModal = new bootstrap.Modal(document.getElementById("infobox"))

//handler處理時段與對應的cover值
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
handler.setInputAction(function (movement) {
  const feature = viewer.scene.pick(movement.position)
  if (feature instanceof Cesium.Cesium3DTileFeature) {
    const propertyNames = feature.getPropertyNames()
    const length = propertyNames.length
    let txt = ""
    const currentTime = Cesium.JulianDate.toDate(viewer.clock.currentTime)
    const currentHour = currentTime.getHours()
    console.log(currentTime.toLocaleTimeString())
    for (let i = 0; i < length; ++i) {
      const propertyName = propertyNames[i]
      if (propertyName === "cover") {
        const idx = currentHour - startHour
        const covers = feature.getProperty(propertyName)
        txt += propertyName + ": " + covers.split(",")[idx]
      } else {
        txt += propertyName + ": " + feature.getProperty(propertyName)
      }
      txt += "</br>"
    }
    const body = document.getElementById("infobox-body")
    body.innerHTML = txt
    infoboxModal.show()
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

//處理選單字串
function loadArea(select) {
  console.log(select.value)
  let path, lat, lng
  switch (select.value) {
    case "All":
      path = "./tileset/tileset.json"
      break
    case "central":
      lat = 24.142506694290326
      lng = 120.67934732732488
      break
    case "east":
      lat = 24.139564335954976
      lng = 120.69270283742098
      break
    case "south":
      lat = 24.126545542811687
      lng = 120.67533889279427
      break
    case "west":
      lat = 24.148477407619062
      lng = 120.66203458377554
      break
    case "north":
      lat = 24.1580380787749
      lng = 120.682205652313
      break
    case "xitun":
      lat = 24.17734393274862
      lng = 120.63963270263578
      break
    case "nantun":
      lat = 24.147236398190497
      lng = 120.60973982121092
      break
    case "beitun":
      lat = 24.17890027340992
      lng = 120.68855027885152
      break
    default:
      break
  }
  if (lat && lng) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat - 0.01, 600),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-25.0),
      },
    })
  } else {
    viewer.flyTo(tileset)
  }
}
