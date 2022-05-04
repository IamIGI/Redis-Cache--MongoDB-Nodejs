# JS-API-CHEATSHEET
Node.js API code cheatsheet, with MongoDB Connection, server configuration

ReMoDO-Read-Through
READ-THROUGH and CACHE-ASIDE
-> Uncomment or comment pointed lines to get the functionality of READ-THROUGH policy or CACHE-ASIDE policy

ReMoDB-Write-Through
READ-THROUGH and WRITE-THROUGH
-> when WRITE operation have place, data is saved to Redis (cache) and MongoDB
-> if data is in redis already, then write operation have place just in mongoDB (around 20 ms faster response time)

ReMoDB-Write-Back
READ-THROUGH and WRITE-BACK
-> when WRITE operation have place, data is saved to Redis (cache)
-> Data is saved to mongodb when atleast 3 keys are in Redis (cache)