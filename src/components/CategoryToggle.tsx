import { useGarden } from '../contexts/GardenContext'

export function CategoryToggle() {
  const { category, setCategory } = useGarden()
  return (
    <div className="flex rounded-xl overflow-hidden border border-gray-200 w-fit">
      <button
        onClick={() => setCategory('garden')}
        className={`px-5 py-2 text-sm font-medium transition-colors ${
          category === 'garden' ? 'bg-garden-bg text-garden-text' : 'bg-white text-gray-400'
        }`}
      >
        🌿 Have
      </button>
      <button
        onClick={() => setCategory('house')}
        className={`px-5 py-2 text-sm font-medium transition-colors ${
          category === 'house' ? 'bg-house-bg text-house-text' : 'bg-white text-gray-400'
        }`}
      >
        🏠 Hus
      </button>
    </div>
  )
}
