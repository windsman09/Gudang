from fastapi import WebSocket


connections = []


async def connect(ws: WebSocket):
    await ws.accept()
    connections.append(ws)


async def disconnect(ws: WebSocket):
    if ws in connections:
        connections.remove(ws)


async def broadcast(data):
    for conn in connections.copy():
        try:
            await conn.send_json(data)
        except Exception:
            if conn in connections:
                connections.remove(conn)
