using Unity.Entities;

namespace Modules.SceneHandling.FlowHandling
{
    public struct IncludeInFlow: IComponentData
    {
        public int index;
    }
}