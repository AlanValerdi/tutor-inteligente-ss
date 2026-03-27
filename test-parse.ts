import { parseTopicContent } from "./lib/content-helpers"

const obj = {
  blocks: [
    {
      type: "TEXT",
      content: "Hello",
      profiles: ["Visual", "Auditivo", "Kinestesico"]
    }
  ],
  version: "1.0"
}

console.log(parseTopicContent(obj))

const str = JSON.stringify(obj)
console.log(parseTopicContent(str))
