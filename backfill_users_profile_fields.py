import boto3
from datetime import datetime, timezone

TABLE_NAME = "cma_users_dev"
PRIMARY_KEY = "userId"

# Add these fields if missing (match your existing naming)
DEFAULTS = {
    "firstName": "",
    "lastName": "",
    "email": "",
    "mlsUsername": "",
    "mlsPasswordSecretId": "",   # secret id (good)
    "brokerageName": "",
    "businessName": "",
    "businessAddress": "",
    "businessCity": "",
    "businessState": "",
    "businessZip": "",
    
}

# Only remove fields you are 100% sure are unwanted.
# Leave empty for now.
REMOVE_FIELDS = [
    # "someOldField",
]

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def nonempty(v):
    if v is None:
        return False
    if isinstance(v, str):
        return v.strip() != ""
    return True

def compute_profile_complete(item):
    required = [
        "firstName",
        "lastName",
        "email",
        "mlsUsername",
        "mlsPasswordSecretId",
        "brokerageName",
        "businessName",
        "businessAddress",
        "businessCity",
        "businessState",
        "businessZip",
    ]
    return all(nonempty(item.get(k)) for k in required)

def update_user(item):
    sets = []
    removes = []
    names = {}
    values = {}

    # Ensure defaults exist
    for k, default_val in DEFAULTS.items():
        if k not in item:
            names[f"#{k}"] = k
            values[f":{k}"] = default_val
            sets.append(f"#{k} = :{k}")

    # createdAt / updatedAt
    if "createdAt" not in item:
        names["#createdAt"] = "createdAt"
        values[":createdAt"] = now_iso()
        sets.append("#createdAt = :createdAt")

    names["#updatedAt"] = "updatedAt"
    values[":updatedAt"] = now_iso()
    sets.append("#updatedAt = :updatedAt")

    # Compute profileComplete on merged item
    merged = dict(item)
    for k, v in DEFAULTS.items():
        merged.setdefault(k, v)
    merged["updatedAt"] = values[":updatedAt"]
    if "createdAt" not in merged:
        merged["createdAt"] = values.get(":createdAt", "")

    pc = compute_profile_complete(merged)
    names["#profileComplete"] = "profileComplete"
    values[":profileComplete"] = pc
    sets.append("#profileComplete = :profileComplete")

    # Remove unwanted fields if present
    for f in REMOVE_FIELDS:
        if f in item:
            names[f"#{f}"] = f
            removes.append(f"#{f}")

    # If nothing to do, skip
    if not sets and not removes:
        return False

    expr_parts = []
    if sets:
        expr_parts.append("SET " + ", ".join(sets))
    if removes:
        expr_parts.append("REMOVE " + ", ".join(removes))

    table.update_item(
        Key={PRIMARY_KEY: item[PRIMARY_KEY]},
        UpdateExpression=" ".join(expr_parts),
        ExpressionAttributeNames=names,
        ExpressionAttributeValues=values,
    )
    return True

def main():
    scanned = 0
    updated = 0

    resp = table.scan()
    while True:
        for item in resp.get("Items", []):
            scanned += 1
            if PRIMARY_KEY not in item:
                print("Skipping item without userId:", item)
                continue
            if update_user(item):
                updated += 1

        if "LastEvaluatedKey" not in resp:
            break
        resp = table.scan(ExclusiveStartKey=resp["LastEvaluatedKey"])

    print(f"Done. Scanned {scanned} users. Updated {updated} users.")

if __name__ == "__main__":
    main()
