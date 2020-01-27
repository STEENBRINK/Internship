using Unity.Entities;

namespace Modules.AudioHandler.AudioSorting
{
    public struct StartAudioOnTrigger: IComponentData
    {
        public AudioTypes type;
    }
}