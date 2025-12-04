// Legacy placeholder kept to avoid breaking imports during the transition away from MeiliSearch.
// Calling this helper now throws an explicit error so that lingering usages can be detected quickly.
export const getMeiliClient = () => {
  throw new Error('MeiliSearch has been removed from this project. Please use Fuse-based search instead.')
}
