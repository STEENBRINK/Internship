using Unity.Entities;

namespace Modules.SceneHandling.FlowHandling
{
    public struct SkipInFlow: IComponentData
    {
        public int index;
    }
}