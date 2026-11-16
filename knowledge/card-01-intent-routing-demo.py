#!/usr/bin/env python3
"""卡1教学演示：Python 3.10+，标准库，无网络/密钥/文件写入。

规则模拟 LLM；同进程 JSON 往返模拟 MCP 调用阶段，非完整 MCP 实现。
真实 MCP 还需初始化、能力协商、工具发现、传输及生命周期管理。
"""
import argparse
import json

TOOL = "get_task_progress"
PROJECTS = ("教师端", "学生端", "track端")
# 与 JS 中传给模型的工具描述类似；真实 API 外层格式因供应商而异。
TOOL_SCHEMA = {
    "name": TOOL,
    "description": "查询指定项目和功能在任务系统中记录的进度",
    "inputSchema": {
        "type": "object",
        "properties": {
            "project": {"type": "string", "enum": list(PROJECTS)},
            "feature": {"type": "string", "minLength": 1},
        },
        "required": ["project", "feature"],
        "additionalProperties": False,
    },
}


def trace(label, value):
    print(f"\n[{label}]")
    print(json.dumps(value, ensure_ascii=False, indent=2)
          if isinstance(value, (dict, list)) else value)


def mock_llm_choose(user_input, context):
    """模拟模型按上下文和工具定义生成调用；不是真实 LLM。"""
    if not any(word in user_input for word in ("进度", "做到哪")):
        return {"clarify": "本演示仅支持任务进度查询，请说明要查什么。"}
    mentioned = [p for p in PROJECTS if p in user_input]
    if len(mentioned) > 1:
        return {"clarify": "请先指定一个项目。"}
    project = mentioned[0] if mentioned else context.get("project")
    if project not in PROJECTS:
        return {"clarify": "你要查教师端、学生端，还是 track端？"}
    feature = next((f for f in ("登录", "支付") if f in user_input), None)
    if feature is None:
        return {"clarify": "请提供功能名称；本演示识别登录或支付。"}
    return {"name": TOOL, "arguments": {"project": project, "feature": feature}}


def validate_call(call):
    """Host 的白名单和参数检查：本例手写，不是通用 JSON Schema 校验器。"""
    if not isinstance(call, dict) or call.get("name") != TOOL:
        raise ValueError("工具不在白名单")
    args = call.get("arguments")
    if not isinstance(args, dict) or set(args) != {"project", "feature"}:
        raise ValueError("参数必须且只能包含 project 和 feature")
    if not isinstance(args["project"], str) or args["project"] not in PROJECTS:
        raise ValueError("project 不合法")
    if not isinstance(args["feature"], str) or not args["feature"].strip():
        raise ValueError("feature 必须是非空字符串")


def tool_result(data):
    # MCP 文本内容块。业务 JSON 放在 text 中，便于观察解析过程。
    return {"content": [{"type": "text", "text": json.dumps(data, ensure_ascii=False)}]}


class MockMCPServer:
    def __init__(self, scenario):
        self.scenario = scenario
        self.attempts = 0

    def handle(self, request):
        """接收已解码的 JSON-RPC 请求；错误分为协议错误与工具执行错误。"""
        request_id = request.get("id")
        if request.get("jsonrpc") != "2.0" or request.get("method") != "tools/call":
            return {"jsonrpc": "2.0", "id": request_id,
                    "error": {"code": -32600, "message": "Invalid Request"}}
        try:
            validate_call(request.get("params"))
        except ValueError as exc:
            return {"jsonrpc": "2.0", "id": request_id,
                    "error": {"code": -32602, "message": str(exc)}}
        self.attempts += 1
        args = request["params"]["arguments"]
        # 生产系统必须在服务端按已认证身份做真正的权限检查。
        if self.scenario == "denied":
            result = tool_result({"code": "PERMISSION_DENIED", "message": "无权读取任务"})
            result["isError"] = True
        elif (self.scenario == "unavailable" or
              (self.scenario == "temporary" and self.attempts == 1)):
            result = tool_result({"code": "TEMPORARY_UNAVAILABLE", "message": "任务服务暂不可用"})
            result["isError"] = True
        elif args != {"project": "学生端", "feature": "登录"}:
            result = tool_result({"found": False})
        else:
            result = tool_result({
                "found": True, "project": "学生端", "feature": "登录",
                "status": "进行中", "completed": ["登录表单", "接口联调"],
                "remaining": ["异常场景测试"], "blockers": [],
                "updated_at": "2026-11-16T10:00:00+08:00",
                "source": "虚构的教学任务记录",
            })
        return {"jsonrpc": "2.0", "id": request_id, "result": result}


class MockMCPClient:
    def __init__(self, server):
        self.server = server
        self.next_id = 0

    def call_tool(self, call, emit):
        self.next_id += 1
        request = {"jsonrpc": "2.0", "id": self.next_id,
                   "method": "tools/call", "params": call}
        emit("Client → Server：JSON-RPC 请求", request)
        # JSON 往返模拟消息边界；没有网络通信。
        response = self.server.handle(json.loads(json.dumps(request)))
        response = json.loads(json.dumps(response))
        emit("Server → Client：JSON-RPC 响应", response)
        if response.get("id") != request["id"] or response.get("jsonrpc") != "2.0":
            raise ValueError("响应不匹配")
        if "error" in response:
            raise ValueError(f"协议错误：{response['error']}")
        return response["result"]


def mock_llm_answer(message):
    """模拟模型读取 Host 回填的数据，而非直接读 JSON-RPC 报文。"""
    data = message["data"]
    if message["is_error"]:
        if data["code"] == "PERMISSION_DENIED":
            return "无权读取该任务，无法确认进度。请联系有权限的交接人，不绕过权限。"
        return "查询服务持续不可用，无法确认进度。请到任务系统人工核对，稍后再试。"
    if not data["found"]:
        return "未查到对应任务，请核对项目和功能名称；未查到不等于尚未开始。"
    blockers = "、".join(data["blockers"]) or "暂未记录阻塞"
    return (f"【教学假数据】按 {data['updated_at']} 的任务记录，"
            f"{data['project']}{data['feature']}功能：{data['status']}。"
            f"已完成：{'、'.join(data['completed'])}；"
            f"剩余：{'、'.join(data['remaining'])}；{blockers}。"
            "这是任务记录状态，不代表已验收或上线。")


def run(scenario="success", emit=trace):
    server = MockMCPServer(scenario)
    client = MockMCPClient(server)
    context = {} if scenario == "clarify" else {"project": "学生端"}
    user_input = "帮我看看支付功能现在做到哪了。" if scenario == "missing" else "帮我看看登录功能现在做到哪了。"
    emit("用户输入 / 上下文", {"input": user_input, "context": context})
    call = mock_llm_choose(user_input, context)
    emit("模拟 LLM 输出（不是 MCP 报文）", call)
    if "clarify" in call:
        emit("最终回答：先澄清，不调用工具", call["clarify"])
        return call["clarify"], server.attempts
    validate_call(call)
    emit("Host 校验", "工具名和参数通过；本例只演示只读工具。")
    # 最多两次；仅对暂时不可用重试。真实系统须额外处理超时和退避。
    for attempt in range(2):
        result = client.call_tool(call, emit)
        data = json.loads(result["content"][0]["text"])
        is_error = result.get("isError", False)
        if is_error and data.get("code") == "TEMPORARY_UNAVAILABLE" and attempt == 0:
            emit("Host 重试策略", "临时故障，允许再试一次；不会无限重试。")
            continue
        break
    # 内部教学结构，不是任何模型供应商的标准 API 消息。
    message = {"tool": call["name"], "data": data, "is_error": is_error}
    emit("Host → 模型：工具结果（内部示意）", message)
    answer = mock_llm_answer(message)
    emit("最终回答", answer)
    return answer, server.attempts


def self_test():
    silent = lambda *_: None
    for scenario, expected, attempts in (
        ("success", "异常场景测试", 1),
        ("clarify", "你要查", 0),
        ("temporary", "异常场景测试", 2),
        ("unavailable", "无法确认进度", 2),
        ("denied", "无权读取", 1),
        ("missing", "未查到", 1),
    ):
        answer, actual = run(scenario, silent)
        assert expected in answer and actual == attempts, (scenario, answer, actual)
    for invalid in (
        {"name": "delete_task", "arguments": {}},
        {"name": TOOL, "arguments": {"project": "学生端", "feature": ""}},
        {"name": TOOL, "arguments": {"project": "未知", "feature": "登录"}},
        {"name": TOOL, "arguments": {"project": "学生端", "feature": "登录", "extra": 1}},
    ):
        try:
            validate_call(invalid)
        except ValueError:
            pass
        else:
            raise AssertionError(f"未拦截非法调用：{invalid}")
    print("PASS：6 个业务场景 + 4 个参数/白名单拦截测试")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", choices=("success", "clarify", "temporary", "unavailable", "denied", "missing"), default="success")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    else:
        run(args.scenario)
