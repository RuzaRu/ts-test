import { Request, Response } from 'express'
import fetch from 'node-fetch'

// @TODO Move
// Helper function (format response)
function formatData(urls) {
  const result = {}

  urls.forEach((url) => {
    const parts = url.replace(/^https?:\/\//, '').split('/')

    const ip = parts.shift()
    let current = (result[ip] = result[ip] || [])

    parts.forEach((part, index) => {
      if (part) {
        part = decodeURIComponent(part)

        if (index === parts.length - 1) {
          current.push(part)
        } else {
          let existing = current.find(
            (entry) => typeof entry === 'object' && entry[part]
          )
          if (!existing) {
            existing = { [part]: [] }
            current.push(existing)
          }
          current = existing[part]
        }
      }
    })
  })

  return result
}

// Main controller
const testController = async (req: Request, res: Response): Promise<void> => {
  try {
    // @TODO Move to env
    const response = await fetch('https://rest-test-eight.vercel.app/api/test')

    if (!response.ok) {
      res.status(response.status).json({ error: 'Failed to fetch data' })
      return
    }

    const readableStream = response.body

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Transfer-Encoding', 'chunked')

    let buffer = ''
    let urls: string[] = []

    for await (const chunk of readableStream) {
      buffer += chunk.toString()

      let start = buffer.indexOf('{"fileUrl":')
      let end = buffer.indexOf('}', start) + 1

      while (start !== -1 && end !== 0) {
        const urlString = buffer.substring(start, end)
        try {
          const urlObject = JSON.parse(urlString)
          if (urlObject.fileUrl) {
            urls.push(urlObject.fileUrl)
          }
        } catch (error) {
          console.error('Failed to parse JSON:', error.message)
        }

        buffer = buffer.substring(end)
        start = buffer.indexOf('{"fileUrl":')
        end = buffer.indexOf('}', start) + 1
      }

      const partialResult = formatData(urls)
      res.write(JSON.stringify(partialResult) + '\n')
      urls = []
    }

    if (urls.length > 0) {
      const finalResult = formatData(urls)
      res.write(JSON.stringify(finalResult) + '\n')
    }
    res.end()
  } catch (error) {
    console.error('Error fetching data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export default testController
