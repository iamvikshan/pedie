import type { Json } from '@app-types/product'

interface ProductSpecsProps {
  specs: Json | null
}

function isRecord(value: Json | null): value is Record<string, Json> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  if (!specs || !isRecord(specs) || Object.keys(specs).length === 0) {
    return null
  }

  return (
    <div>
      <h2 className='text-xl font-bold text-pedie-text mb-4'>Specifications</h2>
      <div className='rounded-lg border border-pedie-border overflow-hidden'>
        <table className='w-full text-sm'>
          <tbody>
            {Object.entries(specs).map(([key, value], index) => (
              <tr
                key={key}
                className={index % 2 === 0 ? 'bg-pedie-card' : 'bg-pedie-dark'}
              >
                <td className='px-4 py-3 font-medium text-pedie-text-muted capitalize whitespace-nowrap'>
                  {key.replace(/_/g, ' ')}
                </td>
                <td className='px-4 py-3 text-pedie-text'>
                  {typeof value === 'object' && value !== null
                    ? JSON.stringify(value)
                    : String(value ?? '')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
