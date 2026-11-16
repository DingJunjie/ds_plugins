---
title: 默认模块
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# 默认模块

Base URLs:

# Authentication

# 教师端/OpenMAIC课件管理

## POST 删除课件

POST /lesson/openmaic/delete

> Body Parameters

```json
{
  "id": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Authorization|header|string| yes |Bearer token|
|body|body|[req.OpenmaicCourseDeleteReq](#schemareq.openmaiccoursedeletereq)| yes |none|

> Response Examples

> 200 Response

```
{}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST 生成互动课件

POST /lesson/openmaic/generate

调用 OpenMAIC 生成互动课堂，支持多个 lesson 共用同一课件。PDF 通过 multipart 上传（可选）

> Body Parameters

```yaml
lessonIds: ""
requirement: ""
pdf: ""

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Authorization|header|string| yes |Bearer token|
|body|body|object| no |none|
|» lessonIds|body|string| yes |课堂ID列表 JSON 数组，如 [\|
|» requirement|body|string| yes |教师需求描述|
|» pdf|body|string(binary)| no |PDF 教材文件（可选）|

> Response Examples

> 200 Response

```json
{
  "courseIds": [
    "string"
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[vo.OpenmaicCourseGenerateVo](#schemavo.openmaiccoursegeneratevo)|

## POST 发布课件

POST /lesson/openmaic/publish

> Body Parameters

```json
{
  "id": "string"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Authorization|header|string| yes |Bearer token|
|body|body|[req.OpenmaicCoursePublishReq](#schemareq.openmaiccoursepublishreq)| yes |none|

> Response Examples

> 200 Response

```json
{
  "status": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[vo.OpenmaicCoursePublishVo](#schemavo.openmaiccoursepublishvo)|

## POST 重新生成课件

POST /lesson/openmaic/regenerate

重新生成课件，PDF 通过 multipart 上传（可选）

> Body Parameters

```yaml
id: ""
requirement: ""
pdf: ""

```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|Authorization|header|string| yes |Bearer token|
|body|body|object| no |none|
|» id|body|string| yes |课件记录ID|
|» requirement|body|string| yes |新的需求描述|
|» pdf|body|string(binary)| no |新的 PDF 教材文件（可选）|

> Response Examples

> 200 Response

```json
{
  "courseIds": [
    "string"
  ]
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[vo.OpenmaicCourseGenerateVo](#schemavo.openmaiccoursegeneratevo)|

## GET 查询课件生成进度

GET /lesson/openmaic/status

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|id|query|string| yes |课件记录ID|
|Authorization|header|string| yes |Bearer token|

> Response Examples

> 200 Response

```json
{
  "createdAt": "string",
  "errorMessage": "string",
  "id": "string",
  "lessonTitle": "string",
  "playbackUrl": "string",
  "progress": 0,
  "progressDetail": null,
  "status": "string"
}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|OK|[vo.OpenmaicCourseStatusVo](#schemavo.openmaiccoursestatusvo)|

# Data Schema

<h2 id="tocS_req.OpenmaicCourseDeleteReq">req.OpenmaicCourseDeleteReq</h2>

<a id="schemareq.openmaiccoursedeletereq"></a>
<a id="schema_req.OpenmaicCourseDeleteReq"></a>
<a id="tocSreq.openmaiccoursedeletereq"></a>
<a id="tocsreq.openmaiccoursedeletereq"></a>

```json
{
  "id": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||lesson_openmaic_course 记录ID|

<h2 id="tocS_req.OpenmaicCoursePublishReq">req.OpenmaicCoursePublishReq</h2>

<a id="schemareq.openmaiccoursepublishreq"></a>
<a id="schema_req.OpenmaicCoursePublishReq"></a>
<a id="tocSreq.openmaiccoursepublishreq"></a>
<a id="tocsreq.openmaiccoursepublishreq"></a>

```json
{
  "id": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|id|string|true|none||lesson_openmaic_course 记录ID|

<h2 id="tocS_vo.OpenmaicCourseGenerateVo">vo.OpenmaicCourseGenerateVo</h2>

<a id="schemavo.openmaiccoursegeneratevo"></a>
<a id="schema_vo.OpenmaicCourseGenerateVo"></a>
<a id="tocSvo.openmaiccoursegeneratevo"></a>
<a id="tocsvo.openmaiccoursegeneratevo"></a>

```json
{
  "courseIds": [
    "string"
  ]
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|courseIds|[string]|false|none||每个lesson对应的 lesson_openmaic_course 记录ID|

<h2 id="tocS_vo.OpenmaicCoursePublishVo">vo.OpenmaicCoursePublishVo</h2>

<a id="schemavo.openmaiccoursepublishvo"></a>
<a id="schema_vo.OpenmaicCoursePublishVo"></a>
<a id="tocSvo.openmaiccoursepublishvo"></a>
<a id="tocsvo.openmaiccoursepublishvo"></a>

```json
{
  "status": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|status|string|false|none||发布后的状态|

<h2 id="tocS_vo.OpenmaicCourseStatusVo">vo.OpenmaicCourseStatusVo</h2>

<a id="schemavo.openmaiccoursestatusvo"></a>
<a id="schema_vo.OpenmaicCourseStatusVo"></a>
<a id="tocSvo.openmaiccoursestatusvo"></a>
<a id="tocsvo.openmaiccoursestatusvo"></a>

```json
{
  "createdAt": "string",
  "errorMessage": "string",
  "id": "string",
  "lessonTitle": "string",
  "playbackUrl": "string",
  "progress": 0,
  "progressDetail": null,
  "status": "string"
}

```

### Attribute

|Name|Type|Required|Restrictions|Title|Description|
|---|---|---|---|---|---|
|createdAt|string|false|none||创建时间|
|errorMessage|string|false|none||失败原因|
|id|string|false|none||记录ID|
|lessonTitle|string|false|none||课堂标题|
|playbackUrl|string|false|none||播放页URL（reviewing/published时才有）|
|progress|integer|false|none||0-100|
|progressDetail|any|false|none||进度详情（step/scenesGenerated/totalScenes等）|
|status|string|false|none||pending/generating/reviewing/published/failed|

