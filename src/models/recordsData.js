
import localForage from "localforage";
function RecordsData(){

}

const _modelPrefix = "record_"
RecordsData.getList = async function(templateId){
    try{
        let key = _modelPrefix + templateId;
        let recordList = await localForage.getItem(key);
        return recordList
    }
    catch{
        return null
    }
}

RecordsData.addRecord = async function(templateId, recordInfo, record){
    try{
        let tempKey = _modelPrefix + templateId;
        let recordList = await localForage.getItem(tempKey) || [];
        let recordId = tempKey + "_" + (new Date()).getTime();
        recordInfo.id = recordId;
        recordList.push(recordInfo)
        localForage.setItem(tempKey, recordList);

        //        
        localForage.setItem(recordId, record);

        return recordId
    }
    catch{
        return null
    }
}


RecordsData.updateRecord = async function(recordId, record){
    try{
        localForage.setItem(recordId, record);
        return true
    }
    catch{
        return false
    }
}




export { RecordsData }