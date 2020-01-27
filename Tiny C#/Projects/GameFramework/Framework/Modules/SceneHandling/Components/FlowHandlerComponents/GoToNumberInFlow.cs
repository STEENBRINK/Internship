using Unity.Entities;

namespace Modules.SceneHandling.FlowHandling
{
    public struct GoToNumberInFlow: IComponentData
    {
        public int flowNumber;
    }
}