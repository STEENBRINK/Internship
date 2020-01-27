using Unity.Authoring.Core;
using Unity.Entities;

namespace Modules.AudioHandler.Core
{
    [HideInInspector]
    public struct AudioID: IComponentData
    {
        public uint ID;
        public bool shouldAllWaysPlay;
    }
}