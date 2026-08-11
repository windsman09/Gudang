from fastapi import WebSocket

connections = []


async def connect(ws: WebSocket):
    await ws.accept()
    connections.append(ws)


async def broadcast(data):
    for conn in connections:
        await conn.send_json(data)


await broadcast({
    "type": "stock_update",
    "item_id": item.id,
    "stock": item.stock
})
