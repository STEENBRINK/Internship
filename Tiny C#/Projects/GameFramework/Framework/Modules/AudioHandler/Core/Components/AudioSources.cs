using Unity.Entities;
using Unity.Tiny;
using Unity.Tiny.Audio;

namespace Modules.AudioHandler.Core
{
    public struct AudioSources : IBufferElementData
    {        
        [EntityWithComponents(typeof(AudioClip))]
        public Entity clip;

        public bool loop;
        public float volume;

        public bool shouldAllwaysPlay;
    }
}