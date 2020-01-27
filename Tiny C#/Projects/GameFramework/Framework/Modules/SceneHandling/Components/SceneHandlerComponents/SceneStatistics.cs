using Unity.Authoring.Core;
using Unity.Entities;
using Unity.Tiny.Scenes;

namespace Modules.SceneHandling
{
    [HideInInspector]
    public struct SceneStatistics: IComponentData
    {
        public SceneGuid previousSceneGuid;
        public int currentScenesLoaded;
        public uint currentID;
    }
}