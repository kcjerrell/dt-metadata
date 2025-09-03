import { memo, lazy } from 'react'

type ToolType = {
  label: string
  component: React.FC
}

export const Tools: Record<string, ToolType> = {
  // arranger: { label: 'Arranger', component: memo(lazy(() => import('./arranger/ArrangerContainer'))) },
  metadata: { label: 'Metadata', component: memo(lazy(() => import('./metadata/MetadataContainer'))) },
  // ace: NoneSelected,
  // script: memo(lazy(() => import('./scripting/ScriptingContainer'))),
  // llm: { label: 'LLM', component: memo(lazy(() => import('./ai/LLM'))) }
}
