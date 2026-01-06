-- Pandoc Lua filter for textbook LaTeX environments
-- Extracts [title=...] arguments and adds them as data attributes

function Div(el)
  -- Check if this div has a class we care about
  local dominated_classes = {
    importantbox = true,
    theorem = true,
    definition = true,
    lemma = true,
    corollary = true,
    example = true,
  }

  for _, class in ipairs(el.classes) do
    if dominated_classes[class] then
      -- Check for title in attributes (Pandoc may parse it)
      local title = el.attributes["title"]
      if title then
        -- Add title as data attribute for CSS
        el.attributes["data-title"] = title
        -- Also prepend a strong element with the title
        local title_elem = pandoc.Strong(pandoc.Str(title))
        local title_para = pandoc.Para({title_elem})
        table.insert(el.content, 1, title_para)
      end
      break
    end
  end

  return el
end

-- Alternative: Process raw LaTeX before conversion
-- This catches \begin{importantbox}[title=X] syntax
function RawBlock(el)
  if el.format == "latex" then
    -- Match importantbox with title
    local env, title, content = el.text:match(
      "\\begin{(importantbox)}%[title=([^%]]+)%](.-)\\end{%1}"
    )
    if env and title then
      -- Return a div with the title as data attribute
      local div = pandoc.Div(pandoc.read(content, "latex").blocks)
      div.classes = {env}
      div.attributes["data-title"] = title
      -- Prepend title as strong
      local title_elem = pandoc.Strong(pandoc.Str(title))
      table.insert(div.content, 1, pandoc.Para({title_elem}))
      return div
    end
  end
  return el
end
