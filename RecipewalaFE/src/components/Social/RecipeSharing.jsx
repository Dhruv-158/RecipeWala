import { useState } from 'react'
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Mail, 
  MessageCircle,
  Link,
  Download,
  QrCode,
  Users,
  Globe,
  Lock
} from 'lucide-react'
import { socialService } from '../../services/socialService'
import { recipeService } from '../../services/recipeService'
import toast from 'react-hot-toast'

const RecipeSharing = ({ recipe, isOpen, onClose }) => {
  const [shareMode, setShareMode] = useState('public') // 'public', 'friends', 'private'
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [shareLink, setShareLink] = useState('')

  const handleShare = async (platform) => {
    try {
      setIsGeneratingLink(true)
      
      // Generate shareable link
      const response = await socialService.generateShareLink(recipe.id, shareMode)
      const link = response.data.shareLink
      setShareLink(link)

      const shareData = {
        title: recipe.title,
        text: `Check out this ${recipe.cuisine || ''} recipe: ${recipe.title}`,
        url: link
      }

      switch (platform) {
        case 'native':
          if (navigator.share) {
            await navigator.share(shareData)
          } else {
            await navigator.clipboard.writeText(link)
            toast.success('Recipe link copied to clipboard!')
          }
          break

        case 'copy':
          await navigator.clipboard.writeText(link)
          toast.success('Recipe link copied to clipboard!')
          break

        case 'facebook':
          const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`
          window.open(fbUrl, '_blank', 'width=600,height=400')
          break

        case 'twitter':
          const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(link)}`
          window.open(twitterUrl, '_blank', 'width=600,height=400')
          break

        case 'email':
          const emailUrl = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(`${shareData.text}\n\n${link}`)}`
          window.open(emailUrl)
          break

        case 'whatsapp':
          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareData.text}\n${link}`)}`
          window.open(whatsappUrl, '_blank')
          break

        default:
          break
      }
    } catch (error) {
      console.error('Failed to share recipe:', error)
      toast.error('Failed to share recipe')
    } finally {
      setIsGeneratingLink(false)
    }
  }

  const handleExportRecipe = async (format) => {
    try {
      const response = await recipeService.exportRecipe(recipe.id, format)
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${recipe.title}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success(`Recipe exported as ${format.toUpperCase()}!`)
    } catch (error) {
      toast.error('Failed to export recipe')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Share Recipe</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Recipe Preview */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900">{recipe.title}</h4>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                <span>{recipe.cookTime}</span>
                <span>{recipe.servings} servings</span>
                <span className="capitalize">{recipe.difficulty}</span>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who can access this recipe?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shareMode"
                    value="public"
                    checked={shareMode === 'public'}
                    onChange={(e) => setShareMode(e.target.value)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Anyone with the link</span>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shareMode"
                    value="friends"
                    checked={shareMode === 'friends'}
                    onChange={(e) => setShareMode(e.target.value)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Friends only</span>
                  </div>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shareMode"
                    value="private"
                    checked={shareMode === 'private'}
                    onChange={(e) => setShareMode(e.target.value)}
                    className="h-4 w-4 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="ml-3 flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Private link</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Share Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Share via
              </label>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                <ShareButton
                  icon={Share2}
                  label="Share"
                  onClick={() => handleShare('native')}
                  disabled={isGeneratingLink}
                />
                
                <ShareButton
                  icon={Copy}
                  label="Copy Link"
                  onClick={() => handleShare('copy')}
                  disabled={isGeneratingLink}
                />
                
                <ShareButton
                  icon={Facebook}
                  label="Facebook"
                  onClick={() => handleShare('facebook')}
                  disabled={isGeneratingLink}
                  color="bg-blue-600"
                />
                
                <ShareButton
                  icon={Twitter}
                  label="Twitter"
                  onClick={() => handleShare('twitter')}
                  disabled={isGeneratingLink}
                  color="bg-sky-500"
                />
                
                <ShareButton
                  icon={MessageCircle}
                  label="WhatsApp"
                  onClick={() => handleShare('whatsapp')}
                  disabled={isGeneratingLink}
                  color="bg-green-600"
                />
                
                <ShareButton
                  icon={Mail}
                  label="Email"
                  onClick={() => handleShare('email')}
                  disabled={isGeneratingLink}
                  color="bg-gray-600"
                />
              </div>
            </div>

            {/* Export Options */}
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export recipe
              </label>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleExportRecipe('pdf')}
                  className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  PDF
                </button>
                
                <button
                  onClick={() => handleExportRecipe('txt')}
                  className="flex-1 bg-gray-500 text-white py-2 px-3 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Text
                </button>
                
                <button
                  onClick={() => handleExportRecipe('json')}
                  className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  JSON
                </button>
              </div>
            </div>

            {shareLink && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-800">Share link generated!</span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-2 py-1 text-xs border border-green-200 rounded bg-white"
                  />
                  <button
                    onClick={() => handleShare('copy')}
                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ShareButton = ({ icon: Icon, label, onClick, disabled, color = 'bg-gray-500' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${color} text-white p-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center space-y-1`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </button>
  )
}

export default RecipeSharing