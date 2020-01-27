using Unity.Authoring.Core;
using Unity.Entities;
using Unity.Tiny.Scenes;

namespace Modules.SceneHandling.FlowHandling
{
    public struct Flow : IBufferElementData
    {
        public SceneReference flowScene;
        public bool disabledInFlow;
        
        //Enable when enums are working correctly
        //public SceneType sceneType;
        
        [HideInInspector]
        public bool defaultScene;
        public bool login;
        public bool game;
        public bool options;
        public bool reward;
        public bool leaderboard;
    }
}