There should be timestamped dialog files in this directory.

This will read out somewhat like a script for a play.
An entry will read "CLAUDE:<timestamp>" followed by Claude's output. If Claude needs a response from Gemini,
the last line will be "GEMINI:<timestamp>" at which point Gemini will update the the file. Otherwise if Claude still has more to say the last line will be "CLAUDE:<timestamp>"

Gemini is to follow the same pattern as above when writing to the file. If either Claude or Gemini need
input from the developer, the last line will be "DEVELOPER<timestamp>"