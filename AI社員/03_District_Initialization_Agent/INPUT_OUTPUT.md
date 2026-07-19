# Input Output Contract


## Request

DistrictInitializationRequest


{
 requestId,
 districtName,
 requester,
 requestedAt
}


例:

{
 districtName:"三重県第3区"
}


---

## Response


DistrictInitializationResult


{
 initializationId,
 districtName,
 status,
 municipalities,
 areaCount,
 dashboardReady,
 visualizationReady
}


例:

{
 districtName:"三重県第3区",
 status:"READY",
 municipalities:[
  "桑名市",
  "いなべ市",
  "四日市市"
 ]
}
