using Unity.Entities;
using Unity.Tiny;
using Unity.Tiny.Audio;

namespace Modules.AudioHandler.Core
{
    public struct SetAudioClip: IComponentData
    {
        [EntityWithComponents(typeof(AudioClip))]
        public Entity clip;

        public uint ID;
        public float volume;
    }
}