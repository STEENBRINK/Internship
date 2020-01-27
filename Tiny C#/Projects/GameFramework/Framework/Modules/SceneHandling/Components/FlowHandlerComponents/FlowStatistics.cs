using Unity.Authoring.Core;
using Unity.Entities;

namespace Modules.SceneHandling.FlowHandling
{
    [HideInInspector]
    public struct FlowStatistics: IComponentData
    {
        public int currentScene;
        public bool isLoggedIn;
        
    }
}