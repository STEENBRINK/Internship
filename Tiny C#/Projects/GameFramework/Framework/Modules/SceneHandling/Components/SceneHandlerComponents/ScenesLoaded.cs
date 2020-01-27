using Unity.Authoring.Core;
 using Unity.Entities;
 
 namespace Modules.SceneHandling
 {
     [HideInInspector]
     public struct ScenesLoaded: IBufferElementData
     {
         public Entity referenceEntity;
     }
 }