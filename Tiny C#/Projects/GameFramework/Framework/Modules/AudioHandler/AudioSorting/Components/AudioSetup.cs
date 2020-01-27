using Unity.Entities;

namespace Modules.AudioHandler.AudioSorting
{
    public struct AudioSetup: IComponentData
    {
        public uint backgroundMusic;
        public uint jump;
        public uint hurt;
        public uint heal;
        public uint click;
        public uint walk;
        public uint explosion;
        public uint pickup;
        public uint ability1;
        public uint ability2;
        public uint ability3;
        public uint gameover;
        public uint countdown;
        public uint gamestart;
        public uint enemy;
        public uint enemyDeath;
        public uint extra1;
        public uint extra2;
    }
}