/*
 * Copyright (c) 2006-2011 Erin Catto http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// DEBUG: import { b2Assert } from "../Common/b2Settings";
import * as Pixi from "pixi.js";
import {
  b2_epsilon,
  b2_maxSubSteps,
  b2_maxTOIContacts
} from "../Common/b2Settings";
import { b2Min, b2Vec2, b2Transform, b2Sweep, XY } from "../Common/b2Math";
import { b2Timer } from "../Common/b2Timer";
import { b2Color, b2Draw, b2DrawFlags } from "../Common/b2Draw";
import {
  b2AABB,
  b2RayCastInput,
  b2RayCastOutput,
  b2TestOverlapShape
} from "../Collision/b2Collision";
import { b2TreeNode } from "../Collision/b2DynamicTree";
import {
  b2TimeOfImpact,
  b2TOIInput,
  b2TOIOutput,
  b2TOIOutputState
} from "../Collision/b2TimeOfImpact";
import { b2Shape, b2ShapeType } from "../Collision/Shapes/b2Shape";
import { b2ChainShape } from "../Collision/Shapes/b2ChainShape";
import { b2CircleShape } from "../Collision/Shapes/b2CircleShape";
import { b2EdgeShape } from "../Collision/Shapes/b2EdgeShape";
import { b2PolygonShape } from "../Collision/Shapes/b2PolygonShape";
import { b2Contact, b2ContactEdge } from "./Contacts/b2Contact";
import {
  b2Joint,
  b2IJointDef,
  b2JointType,
  b2JointEdge
} from "./Joints/b2Joint";
import { b2AreaJoint, b2IAreaJointDef } from "./Joints/b2AreaJoint";
import { b2DistanceJoint, b2IDistanceJointDef } from "./Joints/b2DistanceJoint";
import { b2FrictionJoint, b2IFrictionJointDef } from "./Joints/b2FrictionJoint";
import { b2GearJoint, b2IGearJointDef } from "./Joints/b2GearJoint";
import { b2MotorJoint, b2IMotorJointDef } from "./Joints/b2MotorJoint";
import { b2MouseJoint, b2IMouseJointDef } from "./Joints/b2MouseJoint";
import {
  b2PrismaticJoint,
  b2IPrismaticJointDef
} from "./Joints/b2PrismaticJoint";
import { b2PulleyJoint, b2IPulleyJointDef } from "./Joints/b2PulleyJoint";
import { b2RevoluteJoint, b2IRevoluteJointDef } from "./Joints/b2RevoluteJoint";
import { b2RopeJoint, b2IRopeJointDef } from "./Joints/b2RopeJoint";
import { b2WeldJoint, b2IWeldJointDef } from "./Joints/b2WeldJoint";
import { b2WheelJoint, b2IWheelJointDef } from "./Joints/b2WheelJoint";
import { b2Body, b2IBodyDef, b2BodyType } from "./b2Body";
import { b2ContactManager } from "./b2ContactManager";
import { b2Fixture, b2FixtureProxy } from "./b2Fixture";
import { b2Island } from "./b2Island";
import { b2Profile, b2TimeStep } from "./b2TimeStep";
import { b2ContactFilter } from "./b2WorldCallbacks";
import { b2ContactListener } from "./b2WorldCallbacks";
import { b2DestructionListener } from "./b2WorldCallbacks";
import { b2QueryCallback, b2QueryCallbackFunction } from "./b2WorldCallbacks";
import {
  b2RayCastCallback,
  b2RayCastCallbackFunction
} from "./b2WorldCallbacks";
// #if B2_ENABLE_PARTICLE
import { b2_maxFloat } from "../Common/b2Settings";
import { b2CalculateParticleIterations } from "../Particle/b2Particle";
import {
  b2ParticleSystemDef,
  b2ParticleSystem
} from "../Particle/b2ParticleSystem";
// #endif
// #if B2_ENABLE_CONTROLLER
import { b2Controller, b2ControllerEdge } from "../Controllers/b2Controller";
// #endif

/// The world class manages all physics entities, dynamic simulation,
/// and asynchronous queries. The world also contains efficient memory
/// management facilities.
export class b2World {
  public m_newFixture: boolean = false;
  public m_locked: boolean = false;
  public m_clearForces: boolean = true;

  public readonly m_contactManager: b2ContactManager = new b2ContactManager();

  public m_bodyList: b2Body | null = null;
  public m_jointList: b2Joint | null = null;

  // #if B2_ENABLE_PARTICLE
  public m_particleSystemList: b2ParticleSystem | null = null;
  // #endif

  public m_bodyCount: number = 0;
  public m_jointCount: number = 0;

  public readonly m_gravity: b2Vec2 = new b2Vec2();
  public m_allowSleep: boolean = true;

  public m_destructionListener: b2DestructionListener | null = null;
  public m_debugDraw: b2Draw | null = null;

  // This is used to compute the time step ratio to
  // support a variable time step.
  public m_inv_dt0: number = 0;

  // These are for debugging the solver.
  public m_warmStarting: boolean = true;
  public m_continuousPhysics: boolean = true;
  public m_subStepping: boolean = false;

  public m_stepComplete: boolean = true;

  public readonly m_profile: b2Profile = new b2Profile();

  public readonly m_island: b2Island = new b2Island();

  public readonly s_stack: Array<b2Body | null> = [];

  // #if B2_ENABLE_CONTROLLER
  public m_controllerList: b2Controller | null = null;
  public m_controllerCount: number = 0;
  private pixiToBox2D: number[][] = [];
  private box2DToPixi: number[][] = [];
  private pixiToBox2DScale: number[][] = [];
  private box2DToPixiScale: number[][] = [];
  // #endif

  /// Construct a world object.
  /// @param gravity the world gravity vector.
  constructor(gravity: XY, scale: number, translation: Pixi.Point) {
    this.m_gravity.Copy(gravity);
    console.log(translation.y);

    this.pixiToBox2D[0] = [1, 0, 0];
    this.pixiToBox2D[1] = [0, 1, 0];
    this.pixiToBox2D[2] = [-translation.x * 0.5, -translation.y * 0.5, 1];

    this.box2DToPixi[0] = [1, 0, 0];
    this.box2DToPixi[1] = [0, -1, 0];
    this.box2DToPixi[2] = [translation.x * 0.5, translation.y * 0.5, 1];
  }

  /// Register a destruction listener. The listener is owned by you and must
  /// remain in scope.
  public SetDestructionListener(listener: b2DestructionListener | null): void {
    this.m_destructionListener = listener;
  }

  public PixelToWorldVector(position: Pixi.IPoint) {
    let converterVec = new b2Vec2(position.x, position.y);
    let matrix = this.pixiToBox2D;
    let convertedVec = this.MultiMatrixToVector(converterVec, matrix);
    return convertedVec;
  }

  public WorldToPixelVector(position: b2Vec2) {
    let converterVec = new b2Vec2(position.x, position.y);
    let matrix = this.box2DToPixi;
    converterVec = this.MultiMatrixToVector(converterVec, matrix);
    let convertedVec = new Pixi.Point(converterVec.x, converterVec.y);
    return convertedVec;
  }

  private MultiMatrixToVector(vector: b2Vec2, martix: number[][]) {
    let tempMartix: number[][] = [];
    tempMartix[0] = [vector.x, vector.y, 1];
    tempMartix = this.MultiMatrix(martix, tempMartix);
    return new b2Vec2(tempMartix[0][0], tempMartix[0][1]);
  }

  public MultiMatrix(martix: number[][], otherMartix: number[][]) {
    let tempMartix: number[][] = [];
    let colloms = otherMartix[0].length;
    let rows = otherMartix.length;

    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      let row: number[] = [];
      for (let collomIndex = 0; collomIndex < colloms; collomIndex++) {
        let collom: number = 0;
        for (let multiIndex = 0; multiIndex < colloms; multiIndex++) {
          let a = martix[multiIndex][collomIndex];
          let b = otherMartix[rowIndex][multiIndex];
          collom += a * b;
        }
        row.push(collom);
      }
      tempMartix.push(row);
    }
    return tempMartix;
  }

  private InverseMatrix(matrix: number[][]) {
    //if the matrix isn't square: exit (error)
    if (matrix.length !== matrix[0].length) {
      return;
    }

    //create the identity matrix (I), and a copy (C) of the original
    var i = 0,
      ii = 0,
      j = 0,
      dim = matrix.length,
      e = 0,
      t = 0;
    var identifier = [],
      copy = [];
    for (i = 0; i < dim; i += 1) {
      // Create the row
      identifier[identifier.length] = [];
      copy[copy.length] = [];
      for (j = 0; j < dim; j += 1) {
        //if we're on the diagonal, put a 1 (for identity)
        if (i == j) {
          identifier[i][j] = 1;
        } else {
          identifier[i][j] = 0;
        }

        // Also, make the copy of the original
        copy[i][j] = matrix[i][j];
      }
    }

    // Perform elementary row operations
    for (i = 0; i < dim; i += 1) {
      // get the element e on the diagonal
      e = copy[i][i];

      // if we have a 0 on the diagonal (we'll need to swap with a lower row)
      if (e == 0) {
        //look through every row below the i'th row
        for (ii = i + 1; ii < dim; ii += 1) {
          //if the ii'th row has a non-0 in the i'th col
          if (copy[ii][i] != 0) {
            //it would make the diagonal have a non-0 so swap it
            for (j = 0; j < dim; j++) {
              e = copy[i][j]; //temp store i'th row
              copy[i][j] = copy[ii][j]; //replace i'th row by ii'th
              copy[ii][j] = e; //repace ii'th by temp
              e = identifier[i][j]; //temp store i'th row
              identifier[i][j] = identifier[ii][j]; //replace i'th row by ii'th
              identifier[ii][j] = e; //repace ii'th by temp
            }
            //don't bother checking other rows since we've swapped
            break;
          }
        }
        //get the new diagonal
        e = copy[i][i];
        //if it's still 0, not invertable (error)
        if (e == 0) {
          return;
        }
      }

      // Scale this row down by e (so we have a 1 on the diagonal)
      for (j = 0; j < dim; j++) {
        copy[i][j] = copy[i][j] / e; //apply to original matrix
        identifier[i][j] = identifier[i][j] / e; //apply to identity
      }

      // Subtract this row (scaled appropriately for each row) from ALL of
      // the other rows so that there will be 0's in this column in the
      // rows above and below this one
      for (ii = 0; ii < dim; ii++) {
        // Only apply to other rows (we want a 1 on the diagonal)
        if (ii == i) {
          continue;
        }

        // We want to change this element to 0
        e = copy[ii][i];

        // Subtract (the row above(or below) scaled by e) from (the
        // current row) but start at the i'th column and assume all the
        // stuff left of diagonal is 0 (which it should be if we made this
        // algorithm correctly)
        for (j = 0; j < dim; j++) {
          copy[ii][j] -= e * copy[i][j]; //apply to original matrix
          identifier[ii][j] -= e * identifier[i][j]; //apply to identity
        }
      }
    }

    //we've done all operations, C should be the identity
    //matrix I should be the inverse:
    return identifier;
  }

  private createCopy(matrix) {
    let dim = matrix.length,
      copy = [];
    for (let i = 0; i < dim; i += 1) {
      copy[copy.length] = [];
      for (let j = 0; j < dim; j += 1) {
        copy[i][j] = matrix[i][j];
      }
    }
    return copy;
  }

  private LogMatrix(matrix: number[][]) {
    for (let i = 0; i < matrix.length; i++) {
      const element = matrix[i];
      let log: string = "[";
      for (let j = 0; j < element.length; j++) {
        log += element[j];
        if (j < element.length - 1) log += ",";
      }
      log += "]";
      console.log(log);
    }
  }

  /// Register a contact filter to provide specific control over collision.
  /// Otherwise the default filter is used (b2_defaultFilter). The listener is
  /// owned by you and must remain in scope.
  public SetContactFilter(filter: b2ContactFilter): void {
    this.m_contactManager.m_contactFilter = filter;
  }

  /// Register a contact event listener. The listener is owned by you and must
  /// remain in scope.
  public SetContactListener(listener: b2ContactListener): void {
    this.m_contactManager.m_contactListener = listener;
  }

  /// Register a routine for debug drawing. The debug draw functions are called
  /// inside with b2World::DrawDebugData method. The debug draw object is owned
  /// by you and must remain in scope.
  public SetDebugDraw(debugDraw: b2Draw | null): void {
    this.m_debugDraw = debugDraw;
  }

  /// Create a rigid body given a definition. No reference to the definition
  /// is retained.
  /// @warning This function is locked during callbacks.
  public CreateBody(def: b2IBodyDef = {}): b2Body {
    if (this.IsLocked()) {
      throw new Error();
    }

    const b: b2Body = new b2Body(def, this);

    // Add to world doubly linked list.
    b.m_prev = null;
    b.m_next = this.m_bodyList;
    if (this.m_bodyList) {
      this.m_bodyList.m_prev = b;
    }
    this.m_bodyList = b;
    ++this.m_bodyCount;

    return b;
  }

  /// Destroy a rigid body given a definition. No reference to the definition
  /// is retained. This function is locked during callbacks.
  /// @warning This automatically deletes all associated shapes and joints.
  /// @warning This function is locked during callbacks.
  public DestroyBody(b: b2Body): void {
    // DEBUG: b2Assert(this.m_bodyCount > 0);
    if (this.IsLocked()) {
      throw new Error();
    }

    // Delete the attached joints.
    let je: b2JointEdge | null = b.m_jointList;
    while (je) {
      const je0: b2JointEdge = je;
      je = je.next;

      if (this.m_destructionListener) {
        this.m_destructionListener.SayGoodbyeJoint(je0.joint);
      }

      this.DestroyJoint(je0.joint);

      b.m_jointList = je;
    }
    b.m_jointList = null;

    // #if B2_ENABLE_CONTROLLER
    // @see b2Controller list
    let coe: b2ControllerEdge | null = b.m_controllerList;
    while (coe) {
      const coe0: b2ControllerEdge = coe;
      coe = coe.nextController;
      coe0.controller.RemoveBody(b);
    }
    // #endif

    // Delete the attached contacts.
    let ce: b2ContactEdge | null = b.m_contactList;
    while (ce) {
      const ce0: b2ContactEdge = ce;
      ce = ce.next;
      this.m_contactManager.Destroy(ce0.contact);
    }
    b.m_contactList = null;

    // Delete the attached fixtures. This destroys broad-phase proxies.
    let f: b2Fixture | null = b.m_fixtureList;
    while (f) {
      const f0: b2Fixture = f;
      f = f.m_next;

      if (this.m_destructionListener) {
        this.m_destructionListener.SayGoodbyeFixture(f0);
      }

      f0.DestroyProxies();
      f0.Reset();

      b.m_fixtureList = f;
      b.m_fixtureCount -= 1;
    }
    b.m_fixtureList = null;
    b.m_fixtureCount = 0;

    // Remove world body list.
    if (b.m_prev) {
      b.m_prev.m_next = b.m_next;
    }

    if (b.m_next) {
      b.m_next.m_prev = b.m_prev;
    }

    if (b === this.m_bodyList) {
      this.m_bodyList = b.m_next;
    }

    --this.m_bodyCount;
  }

  private static _Joint_Create(def: b2IJointDef): b2Joint {
    switch (def.type) {
      case b2JointType.e_distanceJoint:
        return new b2DistanceJoint(def as b2IDistanceJointDef);
      case b2JointType.e_mouseJoint:
        return new b2MouseJoint(def as b2IMouseJointDef);
      case b2JointType.e_prismaticJoint:
        return new b2PrismaticJoint(def as b2IPrismaticJointDef);
      case b2JointType.e_revoluteJoint:
        return new b2RevoluteJoint(def as b2IRevoluteJointDef);
      case b2JointType.e_pulleyJoint:
        return new b2PulleyJoint(def as b2IPulleyJointDef);
      case b2JointType.e_gearJoint:
        return new b2GearJoint(def as b2IGearJointDef);
      case b2JointType.e_wheelJoint:
        return new b2WheelJoint(def as b2IWheelJointDef);
      case b2JointType.e_weldJoint:
        return new b2WeldJoint(def as b2IWeldJointDef);
      case b2JointType.e_frictionJoint:
        return new b2FrictionJoint(def as b2IFrictionJointDef);
      case b2JointType.e_ropeJoint:
        return new b2RopeJoint(def as b2IRopeJointDef);
      case b2JointType.e_motorJoint:
        return new b2MotorJoint(def as b2IMotorJointDef);
      case b2JointType.e_areaJoint:
        return new b2AreaJoint(def as b2IAreaJointDef);
    }
    throw new Error();
  }

  private static _Joint_Destroy(joint: b2Joint): void {}

  /// Create a joint to constrain bodies together. No reference to the definition
  /// is retained. This may cause the connected bodies to cease colliding.
  /// @warning This function is locked during callbacks.
  public CreateJoint(def: b2IAreaJointDef): b2AreaJoint;
  public CreateJoint(def: b2IDistanceJointDef): b2DistanceJoint;
  public CreateJoint(def: b2IFrictionJointDef): b2FrictionJoint;
  public CreateJoint(def: b2IGearJointDef): b2GearJoint;
  public CreateJoint(def: b2IMotorJointDef): b2MotorJoint;
  public CreateJoint(def: b2IMouseJointDef): b2MouseJoint;
  public CreateJoint(def: b2IPrismaticJointDef): b2PrismaticJoint;
  public CreateJoint(def: b2IPulleyJointDef): b2PulleyJoint;
  public CreateJoint(def: b2IRevoluteJointDef): b2RevoluteJoint;
  public CreateJoint(def: b2IRopeJointDef): b2RopeJoint;
  public CreateJoint(def: b2IWeldJointDef): b2WeldJoint;
  public CreateJoint(def: b2IWheelJointDef): b2WheelJoint;
  public CreateJoint(def: b2IJointDef): b2Joint {
    if (this.IsLocked()) {
      throw new Error();
    }

    const j: b2Joint = b2World._Joint_Create(def);

    // Connect to the world list.
    j.m_prev = null;
    j.m_next = this.m_jointList;
    if (this.m_jointList) {
      this.m_jointList.m_prev = j;
    }
    this.m_jointList = j;
    ++this.m_jointCount;

    // Connect to the bodies' doubly linked lists.
    // j.m_edgeA.other = j.m_bodyB; // done in b2Joint constructor
    j.m_edgeA.prev = null;
    j.m_edgeA.next = j.m_bodyA.m_jointList;
    if (j.m_bodyA.m_jointList) {
      j.m_bodyA.m_jointList.prev = j.m_edgeA;
    }
    j.m_bodyA.m_jointList = j.m_edgeA;

    // j.m_edgeB.other = j.m_bodyA; // done in b2Joint constructor
    j.m_edgeB.prev = null;
    j.m_edgeB.next = j.m_bodyB.m_jointList;
    if (j.m_bodyB.m_jointList) {
      j.m_bodyB.m_jointList.prev = j.m_edgeB;
    }
    j.m_bodyB.m_jointList = j.m_edgeB;

    const bodyA: b2Body = j.m_bodyA;
    const bodyB: b2Body = j.m_bodyB;
    const collideConnected: boolean = j.m_collideConnected;

    // If the joint prevents collisions, then flag any contacts for filtering.
    if (!collideConnected) {
      let edge: b2ContactEdge | null = bodyB.GetContactList();
      while (edge) {
        if (edge.other === bodyA) {
          // Flag the contact for filtering at the next time step (where either
          // body is awake).
          edge.contact.FlagForFiltering();
        }

        edge = edge.next;
      }
    }

    // Note: creating a joint doesn't wake the bodies.

    return j;
  }

  /// Destroy a joint. This may cause the connected bodies to begin colliding.
  /// @warning This function is locked during callbacks.
  public DestroyJoint(j: b2Joint): void {
    if (this.IsLocked()) {
      throw new Error();
    }

    // Remove from the doubly linked list.
    if (j.m_prev) {
      j.m_prev.m_next = j.m_next;
    }

    if (j.m_next) {
      j.m_next.m_prev = j.m_prev;
    }

    if (j === this.m_jointList) {
      this.m_jointList = j.m_next;
    }

    // Disconnect from island graph.
    const bodyA: b2Body = j.m_bodyA;
    const bodyB: b2Body = j.m_bodyB;
    const collideConnected: boolean = j.m_collideConnected;

    // Wake up connected bodies.
    bodyA.SetAwake(true);
    bodyB.SetAwake(true);

    // Remove from body 1.
    if (j.m_edgeA.prev) {
      j.m_edgeA.prev.next = j.m_edgeA.next;
    }

    if (j.m_edgeA.next) {
      j.m_edgeA.next.prev = j.m_edgeA.prev;
    }

    if (j.m_edgeA === bodyA.m_jointList) {
      bodyA.m_jointList = j.m_edgeA.next;
    }

    j.m_edgeA.Reset();

    // Remove from body 2
    if (j.m_edgeB.prev) {
      j.m_edgeB.prev.next = j.m_edgeB.next;
    }

    if (j.m_edgeB.next) {
      j.m_edgeB.next.prev = j.m_edgeB.prev;
    }

    if (j.m_edgeB === bodyB.m_jointList) {
      bodyB.m_jointList = j.m_edgeB.next;
    }

    j.m_edgeB.Reset();

    b2World._Joint_Destroy(j);

    // DEBUG: b2Assert(this.m_jointCount > 0);
    --this.m_jointCount;

    // If the joint prevents collisions, then flag any contacts for filtering.
    if (!collideConnected) {
      let edge: b2ContactEdge | null = bodyB.GetContactList();
      while (edge) {
        if (edge.other === bodyA) {
          // Flag the contact for filtering at the next time step (where either
          // body is awake).
          edge.contact.FlagForFiltering();
        }

        edge = edge.next;
      }
    }
  }

  // #if B2_ENABLE_PARTICLE

  public CreateParticleSystem(def: b2ParticleSystemDef): b2ParticleSystem {
    if (this.IsLocked()) {
      throw new Error();
    }

    const p = new b2ParticleSystem(def, this);

    // Add to world doubly linked list.
    p.m_prev = null;
    p.m_next = this.m_particleSystemList;
    if (this.m_particleSystemList) {
      this.m_particleSystemList.m_prev = p;
    }
    this.m_particleSystemList = p;

    return p;
  }

  public DestroyParticleSystem(p: b2ParticleSystem): void {
    if (this.IsLocked()) {
      throw new Error();
    }

    // Remove world particleSystem list.
    if (p.m_prev) {
      p.m_prev.m_next = p.m_next;
    }

    if (p.m_next) {
      p.m_next.m_prev = p.m_prev;
    }

    if (p === this.m_particleSystemList) {
      this.m_particleSystemList = p.m_next;
    }
  }

  public CalculateReasonableParticleIterations(timeStep: number): number {
    if (this.m_particleSystemList === null) {
      return 1;
    }

    function GetSmallestRadius(world: b2World): number {
      let smallestRadius = b2_maxFloat;
      for (
        let system = world.GetParticleSystemList();
        system !== null;
        system = system.m_next
      ) {
        smallestRadius = b2Min(smallestRadius, system.GetRadius());
      }
      return smallestRadius;
    }

    // Use the smallest radius, since that represents the worst-case.
    return b2CalculateParticleIterations(
      this.m_gravity.Length(),
      GetSmallestRadius(this),
      timeStep
    );
  }

  // #endif

  /// Take a time step. This performs collision detection, integration,
  /// and constraint solution.
  /// @param timeStep the amount of time to simulate, this should not vary.
  /// @param velocityIterations for the velocity constraint solver.
  /// @param positionIterations for the position constraint solver.
  private static Step_s_step = new b2TimeStep();
  private static Step_s_stepTimer = new b2Timer();
  private static Step_s_timer = new b2Timer();
  // #if B2_ENABLE_PARTICLE
  public Step(
    dt: number,
    velocityIterations: number,
    positionIterations: number,
    particleIterations: number = this.CalculateReasonableParticleIterations(dt)
  ): void {
    // #else
    // public Step(dt: number, velocityIterations: number, positionIterations: number): void {
    // #endif
    const stepTimer: b2Timer = b2World.Step_s_stepTimer.Reset();

    // If new fixtures were added, we need to find the new contacts.
    if (this.m_newFixture) {
      this.m_contactManager.FindNewContacts();
      this.m_newFixture = false;
    }

    this.m_locked = true;

    const step: b2TimeStep = b2World.Step_s_step;
    step.dt = dt;
    step.velocityIterations = velocityIterations;
    step.positionIterations = positionIterations;
    // #if B2_ENABLE_PARTICLE
    step.particleIterations = particleIterations;
    // #endif
    if (dt > 0) {
      step.inv_dt = 1 / dt;
    } else {
      step.inv_dt = 0;
    }

    step.dtRatio = this.m_inv_dt0 * dt;

    step.warmStarting = this.m_warmStarting;

    // Update contacts. This is where some contacts are destroyed.
    const timer: b2Timer = b2World.Step_s_timer.Reset();
    this.m_contactManager.Collide();
    this.m_profile.collide = timer.GetMilliseconds();

    // Integrate velocities, solve velocity constraints, and integrate positions.
    if (this.m_stepComplete && step.dt > 0) {
      const timer: b2Timer = b2World.Step_s_timer.Reset();
      // #if B2_ENABLE_PARTICLE
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        p.Solve(step); // Particle Simulation
      }
      // #endif
      this.Solve(step);
      this.m_profile.solve = timer.GetMilliseconds();
    }

    // Handle TOI events.
    if (this.m_continuousPhysics && step.dt > 0) {
      const timer: b2Timer = b2World.Step_s_timer.Reset();
      this.SolveTOI(step);
      this.m_profile.solveTOI = timer.GetMilliseconds();
    }

    if (step.dt > 0) {
      this.m_inv_dt0 = step.inv_dt;
    }

    if (this.m_clearForces) {
      this.ClearForces();
    }

    this.m_locked = false;

    this.m_profile.step = stepTimer.GetMilliseconds();
  }

  /// Manually clear the force buffer on all bodies. By default, forces are cleared automatically
  /// after each call to Step. The default behavior is modified by calling SetAutoClearForces.
  /// The purpose of this function is to support sub-stepping. Sub-stepping is often used to maintain
  /// a fixed sized time step under a variable frame-rate.
  /// When you perform sub-stepping you will disable auto clearing of forces and instead call
  /// ClearForces after all sub-steps are complete in one pass of your game loop.
  /// @see SetAutoClearForces
  public ClearForces(): void {
    for (let body = this.m_bodyList; body; body = body.m_next) {
      body.m_force.SetZero();
      body.m_torque = 0;
    }
  }

  // #if B2_ENABLE_PARTICLE

  public DrawParticleSystem(system: b2ParticleSystem): void {
    if (this.m_debugDraw === null) {
      return;
    }
    const particleCount = system.GetParticleCount();
    if (particleCount) {
      const radius = system.GetRadius();
      const positionBuffer = system.GetPositionBuffer();
      if (system.m_colorBuffer.data) {
        const colorBuffer = system.GetColorBuffer();
        this.m_debugDraw.DrawParticles(
          positionBuffer,
          radius,
          colorBuffer,
          particleCount
        );
      } else {
        this.m_debugDraw.DrawParticles(
          positionBuffer,
          radius,
          null,
          particleCount
        );
      }
    }
  }

  // #endif

  /// Call this to draw shapes and other debug draw data.
  private static DrawDebugData_s_color = new b2Color(0, 0, 0);
  private static DrawDebugData_s_vs = b2Vec2.MakeArray(4);
  private static DrawDebugData_s_xf = new b2Transform();
  public DrawDebugData(): void {
    if (this.m_debugDraw === null) {
      return;
    }

    const flags: number = this.m_debugDraw.GetFlags();
    const color: b2Color = b2World.DrawDebugData_s_color.SetRGB(0, 0, 0);

    if (flags & b2DrawFlags.e_shapeBit) {
      for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
        const xf: b2Transform = b.m_xf;

        this.m_debugDraw.PushTransform(xf);

        for (let f: b2Fixture | null = b.GetFixtureList(); f; f = f.m_next) {
          if (!b.IsActive()) {
            color.SetRGB(0.5, 0.5, 0.3);
            this.DrawShape(f, color);
          } else if (b.GetType() === b2BodyType.b2_staticBody) {
            color.SetRGB(0.5, 0.9, 0.5);
            this.DrawShape(f, color);
          } else if (b.GetType() === b2BodyType.b2_kinematicBody) {
            color.SetRGB(0.5, 0.5, 0.9);
            this.DrawShape(f, color);
          } else if (!b.IsAwake()) {
            color.SetRGB(0.6, 0.6, 0.6);
            this.DrawShape(f, color);
          } else {
            color.SetRGB(0.9, 0.7, 0.7);
            this.DrawShape(f, color);
          }
        }

        this.m_debugDraw.PopTransform(xf);
      }
    }

    // #if B2_ENABLE_PARTICLE
    if (flags & b2DrawFlags.e_particleBit) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        this.DrawParticleSystem(p);
      }
    }
    // #endif

    if (flags & b2DrawFlags.e_jointBit) {
      for (let j: b2Joint | null = this.m_jointList; j; j = j.m_next) {
        this.DrawJoint(j);
      }
    }

    /*
    if (flags & b2DrawFlags.e_pairBit) {
      color.SetRGB(0.3, 0.9, 0.9);
      for (let contact = this.m_contactManager.m_contactList; contact; contact = contact.m_next) {
        const fixtureA = contact.GetFixtureA();
        const fixtureB = contact.GetFixtureB();

        const cA = fixtureA.GetAABB().GetCenter();
        const cB = fixtureB.GetAABB().GetCenter();

        this.m_debugDraw.DrawSegment(cA, cB, color);
      }
    }
    */

    if (flags & b2DrawFlags.e_aabbBit) {
      color.SetRGB(0.9, 0.3, 0.9);
      const vs: b2Vec2[] = b2World.DrawDebugData_s_vs;

      for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
        if (!b.IsActive()) {
          continue;
        }

        for (let f: b2Fixture | null = b.GetFixtureList(); f; f = f.m_next) {
          for (let i: number = 0; i < f.m_proxyCount; ++i) {
            const proxy: b2FixtureProxy = f.m_proxies[i];

            const aabb: b2AABB = proxy.treeNode.aabb;
            vs[0].Set(aabb.lowerBound.x, aabb.lowerBound.y);
            vs[1].Set(aabb.upperBound.x, aabb.lowerBound.y);
            vs[2].Set(aabb.upperBound.x, aabb.upperBound.y);
            vs[3].Set(aabb.lowerBound.x, aabb.upperBound.y);

            this.m_debugDraw.DrawPolygon(vs, 4, color);
          }
        }
      }
    }

    if (flags & b2DrawFlags.e_centerOfMassBit) {
      for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
        const xf: b2Transform = b2World.DrawDebugData_s_xf;
        xf.q.Copy(b.m_xf.q);
        xf.p.Copy(b.GetWorldCenter());
        this.m_debugDraw.DrawTransform(xf);
      }
    }

    // #if B2_ENABLE_CONTROLLER
    // @see b2Controller list
    if (flags & b2DrawFlags.e_controllerBit) {
      for (let c = this.m_controllerList; c; c = c.m_next) {
        c.Draw(this.m_debugDraw);
      }
    }
    // #endif
  }

  /// Query the world for all fixtures that potentially overlap the
  /// provided AABB.
  /// @param callback a user implemented callback class.
  /// @param aabb the query box.
  public QueryAABB(callback: b2QueryCallback, aabb: b2AABB): void;
  public QueryAABB(aabb: b2AABB, fn: b2QueryCallbackFunction): void;
  public QueryAABB(...args: any[]): void {
    if (args[0] instanceof b2QueryCallback) {
      this._QueryAABB(args[0], args[1]);
    } else {
      this._QueryAABB(null, args[0], args[1]);
    }
  }
  private _QueryAABB(
    callback: b2QueryCallback | null,
    aabb: b2AABB,
    fn?: b2QueryCallbackFunction
  ): void {
    this.m_contactManager.m_broadPhase.Query(
      aabb,
      (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
        const fixture_proxy: b2FixtureProxy = proxy.userData;
        // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
        const fixture: b2Fixture = fixture_proxy.fixture;
        if (callback) {
          return callback.ReportFixture(fixture);
        } else if (fn) {
          return fn(fixture);
        }
        return true;
      }
    );
    // #if B2_ENABLE_PARTICLE
    if (callback instanceof b2QueryCallback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.QueryAABB(callback, aabb);
        }
      }
    }
    // #endif
  }

  public QueryAllAABB(aabb: b2AABB, out: b2Fixture[] = []): b2Fixture[] {
    this.QueryAABB(aabb, (fixture: b2Fixture): boolean => {
      out.push(fixture);
      return true;
    });
    return out;
  }

  /// Query the world for all fixtures that potentially overlap the
  /// provided point.
  /// @param callback a user implemented callback class.
  /// @param point the query point.
  public QueryPointAABB(callback: b2QueryCallback, point: XY): void;
  public QueryPointAABB(point: XY, fn: b2QueryCallbackFunction): void;
  public QueryPointAABB(...args: any[]): void {
    if (args[0] instanceof b2QueryCallback) {
      this._QueryPointAABB(args[0], args[1]);
    } else {
      this._QueryPointAABB(null, args[0], args[1]);
    }
  }
  private _QueryPointAABB(
    callback: b2QueryCallback | null,
    point: XY,
    fn?: b2QueryCallbackFunction
  ): void {
    this.m_contactManager.m_broadPhase.QueryPoint(
      point,
      (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
        const fixture_proxy: b2FixtureProxy = proxy.userData;
        // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
        const fixture: b2Fixture = fixture_proxy.fixture;
        if (callback) {
          return callback.ReportFixture(fixture);
        } else if (fn) {
          return fn(fixture);
        }
        return true;
      }
    );
    // #if B2_ENABLE_PARTICLE
    if (callback instanceof b2QueryCallback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.QueryPointAABB(callback, point);
        }
      }
    }
    // #endif
  }

  public QueryAllPointAABB(point: XY, out: b2Fixture[] = []): b2Fixture[] {
    this.QueryPointAABB(point, (fixture: b2Fixture): boolean => {
      out.push(fixture);
      return true;
    });
    return out;
  }

  public QueryFixtureShape(
    callback: b2QueryCallback,
    shape: b2Shape,
    index: number,
    transform: b2Transform
  ): void;
  public QueryFixtureShape(
    shape: b2Shape,
    index: number,
    transform: b2Transform,
    fn: b2QueryCallbackFunction
  ): void;
  public QueryFixtureShape(...args: any[]): void {
    if (args[0] instanceof b2QueryCallback) {
      this._QueryFixtureShape(args[0], args[1], args[2], args[3]);
    } else {
      this._QueryFixtureShape(null, args[0], args[1], args[2], args[3]);
    }
  }
  private static QueryFixtureShape_s_aabb = new b2AABB();
  private _QueryFixtureShape(
    callback: b2QueryCallback | null,
    shape: b2Shape,
    index: number,
    transform: b2Transform,
    fn?: b2QueryCallbackFunction
  ): void {
    const aabb: b2AABB = b2World.QueryFixtureShape_s_aabb;
    shape.ComputeAABB(aabb, transform, index);
    this.m_contactManager.m_broadPhase.Query(
      aabb,
      (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
        const fixture_proxy: b2FixtureProxy = proxy.userData;
        // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
        const fixture: b2Fixture = fixture_proxy.fixture;
        if (
          b2TestOverlapShape(
            shape,
            index,
            fixture.GetShape(),
            fixture_proxy.childIndex,
            transform,
            fixture.GetBody().GetTransform()
          )
        ) {
          if (callback) {
            return callback.ReportFixture(fixture);
          } else if (fn) {
            return fn(fixture);
          }
        }
        return true;
      }
    );
    // #if B2_ENABLE_PARTICLE
    if (callback instanceof b2QueryCallback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.QueryAABB(callback, aabb);
        }
      }
    }
    // #endif
  }

  public QueryAllFixtureShape(
    shape: b2Shape,
    index: number,
    transform: b2Transform,
    out: b2Fixture[] = []
  ): b2Fixture[] {
    this.QueryFixtureShape(
      shape,
      index,
      transform,
      (fixture: b2Fixture): boolean => {
        out.push(fixture);
        return true;
      }
    );
    return out;
  }

  public QueryFixturePoint(callback: b2QueryCallback, point: XY): void;
  public QueryFixturePoint(point: XY, fn: b2QueryCallbackFunction): void;
  public QueryFixturePoint(...args: any[]): void {
    if (args[0] instanceof b2QueryCallback) {
      this._QueryFixturePoint(args[0], args[1]);
    } else {
      this._QueryFixturePoint(null, args[0], args[1]);
    }
  }
  private _QueryFixturePoint(
    callback: b2QueryCallback | null,
    point: XY,
    fn?: b2QueryCallbackFunction
  ): void {
    this.m_contactManager.m_broadPhase.QueryPoint(
      point,
      (proxy: b2TreeNode<b2FixtureProxy>): boolean => {
        const fixture_proxy: b2FixtureProxy = proxy.userData;
        // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
        const fixture: b2Fixture = fixture_proxy.fixture;
        if (fixture.TestPoint(point)) {
          if (callback) {
            return callback.ReportFixture(fixture);
          } else if (fn) {
            return fn(fixture);
          }
        }
        return true;
      }
    );
    // #if B2_ENABLE_PARTICLE
    if (callback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.QueryPointAABB(callback, point);
        }
      }
    }
    // #endif
  }

  public QueryAllFixturePoint(point: XY, out: b2Fixture[] = []): b2Fixture[] {
    this.QueryFixturePoint(point, (fixture: b2Fixture): boolean => {
      out.push(fixture);
      return true;
    });
    return out;
  }

  /// Ray-cast the world for all fixtures in the path of the ray. Your callback
  /// controls whether you get the closest point, any point, or n-points.
  /// The ray-cast ignores shapes that contain the starting point.
  /// @param callback a user implemented callback class.
  /// @param point1 the ray starting point
  /// @param point2 the ray ending point
  public RayCast(callback: b2RayCastCallback, point1: XY, point2: XY): void;
  public RayCast(point1: XY, point2: XY, fn: b2RayCastCallbackFunction): void;
  public RayCast(...args: any[]): void {
    if (args[0] instanceof b2RayCastCallback) {
      this._RayCast(args[0], args[1], args[2]);
    } else {
      this._RayCast(null, args[0], args[1], args[2]);
    }
  }
  private static RayCast_s_input = new b2RayCastInput();
  private static RayCast_s_output = new b2RayCastOutput();
  private static RayCast_s_point = new b2Vec2();
  private _RayCast(
    callback: b2RayCastCallback | null,
    point1: XY,
    point2: XY,
    fn?: b2RayCastCallbackFunction
  ): void {
    const input: b2RayCastInput = b2World.RayCast_s_input;
    input.maxFraction = 1;
    input.p1.Copy(point1);
    input.p2.Copy(point2);
    this.m_contactManager.m_broadPhase.RayCast(
      input,
      (input: b2RayCastInput, proxy: b2TreeNode<b2FixtureProxy>): number => {
        const fixture_proxy: b2FixtureProxy = proxy.userData;
        // DEBUG: b2Assert(fixture_proxy instanceof b2FixtureProxy);
        const fixture: b2Fixture = fixture_proxy.fixture;
        const index: number = fixture_proxy.childIndex;
        const output: b2RayCastOutput = b2World.RayCast_s_output;
        const hit: boolean = fixture.RayCast(output, input, index);
        if (hit) {
          const fraction: number = output.fraction;
          const point: b2Vec2 = b2World.RayCast_s_point;
          point.Set(
            (1 - fraction) * point1.x + fraction * point2.x,
            (1 - fraction) * point1.y + fraction * point2.y
          );
          if (callback) {
            return callback.ReportFixture(
              fixture,
              point,
              output.normal,
              fraction
            );
          } else if (fn) {
            return fn(fixture, point, output.normal, fraction);
          }
        }
        return input.maxFraction;
      }
    );
    // #if B2_ENABLE_PARTICLE
    if (callback) {
      for (let p = this.m_particleSystemList; p; p = p.m_next) {
        if (callback.ShouldQueryParticleSystem(p)) {
          p.RayCast(callback, point1, point2);
        }
      }
    }
    // #endif
  }

  public RayCastOne(point1: XY, point2: XY): b2Fixture | null {
    let result: b2Fixture | null = null;
    let min_fraction: number = 1;
    this.RayCast(
      point1,
      point2,
      (
        fixture: b2Fixture,
        point: b2Vec2,
        normal: b2Vec2,
        fraction: number
      ): number => {
        if (fraction < min_fraction) {
          min_fraction = fraction;
          result = fixture;
        }
        return min_fraction;
      }
    );
    return result;
  }

  public RayCastAll(
    point1: XY,
    point2: XY,
    out: b2Fixture[] = []
  ): b2Fixture[] {
    this.RayCast(
      point1,
      point2,
      (
        fixture: b2Fixture,
        point: b2Vec2,
        normal: b2Vec2,
        fraction: number
      ): number => {
        out.push(fixture);
        return 1;
      }
    );
    return out;
  }

  /// Get the world body list. With the returned body, use b2Body::GetNext to get
  /// the next body in the world list. A NULL body indicates the end of the list.
  /// @return the head of the world body list.
  public GetBodyList(): b2Body | null {
    return this.m_bodyList;
  }

  /// Get the world joint list. With the returned joint, use b2Joint::GetNext to get
  /// the next joint in the world list. A NULL joint indicates the end of the list.
  /// @return the head of the world joint list.
  public GetJointList(): b2Joint | null {
    return this.m_jointList;
  }

  // #if B2_ENABLE_PARTICLE
  public GetParticleSystemList(): b2ParticleSystem | null {
    return this.m_particleSystemList;
  }
  // #endif

  /// Get the world contact list. With the returned contact, use b2Contact::GetNext to get
  /// the next contact in the world list. A NULL contact indicates the end of the list.
  /// @return the head of the world contact list.
  /// @warning contacts are created and destroyed in the middle of a time step.
  /// Use b2ContactListener to avoid missing contacts.
  public GetContactList(): b2Contact | null {
    return this.m_contactManager.m_contactList;
  }

  /// Enable/disable sleep.
  public SetAllowSleeping(flag: boolean): void {
    if (flag === this.m_allowSleep) {
      return;
    }

    this.m_allowSleep = flag;
    if (!this.m_allowSleep) {
      for (let b = this.m_bodyList; b; b = b.m_next) {
        b.SetAwake(true);
      }
    }
  }

  public GetAllowSleeping(): boolean {
    return this.m_allowSleep;
  }

  /// Enable/disable warm starting. For testing.
  public SetWarmStarting(flag: boolean): void {
    this.m_warmStarting = flag;
  }

  public GetWarmStarting(): boolean {
    return this.m_warmStarting;
  }

  /// Enable/disable continuous physics. For testing.
  public SetContinuousPhysics(flag: boolean): void {
    this.m_continuousPhysics = flag;
  }

  public GetContinuousPhysics(): boolean {
    return this.m_continuousPhysics;
  }

  /// Enable/disable single stepped continuous physics. For testing.
  public SetSubStepping(flag: boolean): void {
    this.m_subStepping = flag;
  }

  public GetSubStepping(): boolean {
    return this.m_subStepping;
  }

  /// Get the number of broad-phase proxies.
  public GetProxyCount(): number {
    return this.m_contactManager.m_broadPhase.GetProxyCount();
  }

  /// Get the number of bodies.
  public GetBodyCount(): number {
    return this.m_bodyCount;
  }

  /// Get the number of joints.
  public GetJointCount(): number {
    return this.m_jointCount;
  }

  /// Get the number of contacts (each may have 0 or more contact points).
  public GetContactCount(): number {
    return this.m_contactManager.m_contactCount;
  }

  /// Get the height of the dynamic tree.
  public GetTreeHeight(): number {
    return this.m_contactManager.m_broadPhase.GetTreeHeight();
  }

  /// Get the balance of the dynamic tree.
  public GetTreeBalance(): number {
    return this.m_contactManager.m_broadPhase.GetTreeBalance();
  }

  /// Get the quality metric of the dynamic tree. The smaller the better.
  /// The minimum is 1.
  public GetTreeQuality(): number {
    return this.m_contactManager.m_broadPhase.GetTreeQuality();
  }

  /// Change the global gravity vector.
  public SetGravity(gravity: XY, wake: boolean = true) {
    if (!b2Vec2.IsEqualToV(this.m_gravity, gravity)) {
      this.m_gravity.Copy(gravity);

      if (wake) {
        for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
          b.SetAwake(true);
        }
      }
    }
  }

  /// Get the global gravity vector.
  public GetGravity(): Readonly<b2Vec2> {
    return this.m_gravity;
  }

  /// Is the world locked (in the middle of a time step).
  public IsLocked(): boolean {
    return this.m_locked;
  }

  /// Set flag to control automatic clearing of forces after each time step.
  public SetAutoClearForces(flag: boolean): void {
    this.m_clearForces = flag;
  }

  /// Get the flag that controls automatic clearing of forces after each time step.
  public GetAutoClearForces(): boolean {
    return this.m_clearForces;
  }

  /// Shift the world origin. Useful for large worlds.
  /// The body shift formula is: position -= newOrigin
  /// @param newOrigin the new origin with respect to the old origin
  public ShiftOrigin(newOrigin: XY): void {
    if (this.IsLocked()) {
      throw new Error();
    }

    for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
      b.m_xf.p.SelfSub(newOrigin);
      b.m_sweep.c0.SelfSub(newOrigin);
      b.m_sweep.c.SelfSub(newOrigin);
    }

    for (let j: b2Joint | null = this.m_jointList; j; j = j.m_next) {
      j.ShiftOrigin(newOrigin);
    }

    this.m_contactManager.m_broadPhase.ShiftOrigin(newOrigin);
  }

  /// Get the contact manager for testing.
  public GetContactManager(): b2ContactManager {
    return this.m_contactManager;
  }

  /// Get the current profile.
  public GetProfile(): b2Profile {
    return this.m_profile;
  }

  /// Dump the world into the log file.
  /// @warning this should be called outside of a time step.
  public Dump(log: (format: string, ...args: any[]) => void): void {
    if (this.m_locked) {
      return;
    }

    log(
      "const g: b2Vec2 = new b2Vec2(%.15f, %.15f);\n",
      this.m_gravity.x,
      this.m_gravity.y
    );
    log("this.m_world.SetGravity(g);\n");

    log("const bodies: b2Body[] = [];\n");
    log("const joints: b2Joint[] = [];\n");
    let i: number = 0;
    for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
      b.m_islandIndex = i;
      b.Dump(log);
      ++i;
    }

    i = 0;
    for (let j: b2Joint | null = this.m_jointList; j; j = j.m_next) {
      j.m_index = i;
      ++i;
    }

    // First pass on joints, skip gear joints.
    for (let j: b2Joint | null = this.m_jointList; j; j = j.m_next) {
      if (j.m_type === b2JointType.e_gearJoint) {
        continue;
      }

      log("{\n");
      j.Dump(log);
      log("}\n");
    }

    // Second pass on joints, only gear joints.
    for (let j: b2Joint | null = this.m_jointList; j; j = j.m_next) {
      if (j.m_type !== b2JointType.e_gearJoint) {
        continue;
      }

      log("{\n");
      j.Dump(log);
      log("}\n");
    }
  }

  private static DrawJoint_s_p1: b2Vec2 = new b2Vec2();
  private static DrawJoint_s_p2: b2Vec2 = new b2Vec2();
  private static DrawJoint_s_color: b2Color = new b2Color(0.5, 0.8, 0.8);
  private static DrawJoint_s_c: b2Color = new b2Color();
  public DrawJoint(joint: b2Joint): void {
    if (this.m_debugDraw === null) {
      return;
    }
    const bodyA: b2Body = joint.GetBodyA();
    const bodyB: b2Body = joint.GetBodyB();
    const xf1: b2Transform = bodyA.m_xf;
    const xf2: b2Transform = bodyB.m_xf;
    const x1: b2Vec2 = xf1.p;
    const x2: b2Vec2 = xf2.p;
    const p1: b2Vec2 = joint.GetAnchorA(b2World.DrawJoint_s_p1);
    const p2: b2Vec2 = joint.GetAnchorB(b2World.DrawJoint_s_p2);

    const color: b2Color = b2World.DrawJoint_s_color.SetRGB(0.5, 0.8, 0.8);

    switch (joint.m_type) {
      case b2JointType.e_distanceJoint:
        this.m_debugDraw.DrawSegment(p1, p2, color);
        break;

      case b2JointType.e_pulleyJoint: {
        const pulley: b2PulleyJoint = joint as b2PulleyJoint;
        const s1: b2Vec2 = pulley.GetGroundAnchorA();
        const s2: b2Vec2 = pulley.GetGroundAnchorB();
        this.m_debugDraw.DrawSegment(s1, p1, color);
        this.m_debugDraw.DrawSegment(s2, p2, color);
        this.m_debugDraw.DrawSegment(s1, s2, color);
        break;
      }

      case b2JointType.e_mouseJoint: {
        const c = b2World.DrawJoint_s_c;
        c.Set(0.0, 1.0, 0.0);
        this.m_debugDraw.DrawPoint(p1, 4.0, c);
        this.m_debugDraw.DrawPoint(p2, 4.0, c);

        c.Set(0.8, 0.8, 0.8);
        this.m_debugDraw.DrawSegment(p1, p2, c);
        break;
      }

      default:
        this.m_debugDraw.DrawSegment(x1, p1, color);
        this.m_debugDraw.DrawSegment(p1, p2, color);
        this.m_debugDraw.DrawSegment(x2, p2, color);
    }
  }

  private static DrawShape_s_ghostColor: b2Color = new b2Color();
  public DrawShape(fixture: b2Fixture, color: b2Color): void {
    if (this.m_debugDraw === null) {
      return;
    }
    const shape: b2Shape = fixture.GetShape();

    switch (shape.m_type) {
      case b2ShapeType.e_circleShape: {
        const circle: b2CircleShape = shape as b2CircleShape;
        const center: b2Vec2 = circle.m_p;
        const radius: number = circle.m_radius;
        const axis: b2Vec2 = b2Vec2.UNITX;
        this.m_debugDraw.DrawSolidCircle(center, radius, axis, color);
        break;
      }

      case b2ShapeType.e_edgeShape: {
        const edge: b2EdgeShape = shape as b2EdgeShape;
        const v1: b2Vec2 = edge.m_vertex1;
        const v2: b2Vec2 = edge.m_vertex2;
        this.m_debugDraw.DrawSegment(v1, v2, color);
        break;
      }

      case b2ShapeType.e_chainShape: {
        const chain: b2ChainShape = shape as b2ChainShape;
        const count: number = chain.m_count;
        const vertices: b2Vec2[] = chain.m_vertices;
        const ghostColor: b2Color = b2World.DrawShape_s_ghostColor.SetRGBA(
          0.75 * color.r,
          0.75 * color.g,
          0.75 * color.b,
          color.a
        );
        let v1: b2Vec2 = vertices[0];
        this.m_debugDraw.DrawPoint(v1, 4.0, color);

        if (chain.m_hasPrevVertex) {
          const vp = chain.m_prevVertex;
          this.m_debugDraw.DrawSegment(vp, v1, ghostColor);
          this.m_debugDraw.DrawCircle(vp, 0.1, ghostColor);
        }

        for (let i: number = 1; i < count; ++i) {
          const v2: b2Vec2 = vertices[i];
          this.m_debugDraw.DrawSegment(v1, v2, color);
          this.m_debugDraw.DrawPoint(v2, 4.0, color);
          v1 = v2;
        }

        if (chain.m_hasNextVertex) {
          const vn = chain.m_nextVertex;
          this.m_debugDraw.DrawSegment(vn, v1, ghostColor);
          this.m_debugDraw.DrawCircle(vn, 0.1, ghostColor);
        }
        break;
      }

      case b2ShapeType.e_polygonShape: {
        const poly: b2PolygonShape = shape as b2PolygonShape;
        const vertexCount: number = poly.m_count;
        const vertices: b2Vec2[] = poly.m_vertices;
        this.m_debugDraw.DrawSolidPolygon(vertices, vertexCount, color);
        break;
      }
    }
  }

  public Solve(step: b2TimeStep): void {
    // #if B2_ENABLE_PARTICLE
    // update previous transforms
    for (let b = this.m_bodyList; b; b = b.m_next) {
      b.m_xf0.Copy(b.m_xf);
    }
    // #endif

    // #if B2_ENABLE_CONTROLLER
    // @see b2Controller list
    for (
      let controller = this.m_controllerList;
      controller;
      controller = controller.m_next
    ) {
      controller.Step(step);
    }
    // #endif

    this.m_profile.solveInit = 0;
    this.m_profile.solveVelocity = 0;
    this.m_profile.solvePosition = 0;

    // Size the island for the worst case.
    const island: b2Island = this.m_island;
    island.Initialize(
      this.m_bodyCount,
      this.m_contactManager.m_contactCount,
      this.m_jointCount,
      this.m_contactManager.m_contactListener
    );

    // Clear all the island flags.
    for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
      b.m_islandFlag = false;
    }
    for (
      let c: b2Contact | null = this.m_contactManager.m_contactList;
      c;
      c = c.m_next
    ) {
      c.m_islandFlag = false;
    }
    for (let j: b2Joint | null = this.m_jointList; j; j = j.m_next) {
      j.m_islandFlag = false;
    }

    // Build and simulate all awake islands.
    // DEBUG: const stackSize: number = this.m_bodyCount;
    const stack: Array<b2Body | null> = this.s_stack;
    for (let seed: b2Body | null = this.m_bodyList; seed; seed = seed.m_next) {
      if (seed.m_islandFlag) {
        continue;
      }

      if (!seed.IsAwake() || !seed.IsActive()) {
        continue;
      }

      // The seed can be dynamic or kinematic.
      if (seed.GetType() === b2BodyType.b2_staticBody) {
        continue;
      }

      // Reset island and stack.
      island.Clear();
      let stackCount: number = 0;
      stack[stackCount++] = seed;
      seed.m_islandFlag = true;

      // Perform a depth first search (DFS) on the constraint graph.
      while (stackCount > 0) {
        // Grab the next body off the stack and add it to the island.
        const b: b2Body | null = stack[--stackCount];
        if (!b) {
          throw new Error();
        }
        // DEBUG: b2Assert(b.IsActive());
        island.AddBody(b);

        // Make sure the body is awake. (without resetting sleep timer).
        b.m_awakeFlag = true;

        // To keep islands as small as possible, we don't
        // propagate islands across static bodies.
        if (b.GetType() === b2BodyType.b2_staticBody) {
          continue;
        }

        // Search all contacts connected to this body.
        for (let ce: b2ContactEdge | null = b.m_contactList; ce; ce = ce.next) {
          const contact: b2Contact = ce.contact;

          // Has this contact already been added to an island?
          if (contact.m_islandFlag) {
            continue;
          }

          // Is this contact solid and touching?
          if (!contact.IsEnabled() || !contact.IsTouching()) {
            continue;
          }

          // Skip sensors.
          const sensorA: boolean = contact.m_fixtureA.m_isSensor;
          const sensorB: boolean = contact.m_fixtureB.m_isSensor;
          if (sensorA || sensorB) {
            continue;
          }

          island.AddContact(contact);
          contact.m_islandFlag = true;

          const other: b2Body = ce.other;

          // Was the other body already added to this island?
          if (other.m_islandFlag) {
            continue;
          }

          // DEBUG: b2Assert(stackCount < stackSize);
          stack[stackCount++] = other;
          other.m_islandFlag = true;
        }

        // Search all joints connect to this body.
        for (let je: b2JointEdge | null = b.m_jointList; je; je = je.next) {
          if (je.joint.m_islandFlag) {
            continue;
          }

          const other: b2Body = je.other;

          // Don't simulate joints connected to inactive bodies.
          if (!other.IsActive()) {
            continue;
          }

          island.AddJoint(je.joint);
          je.joint.m_islandFlag = true;

          if (other.m_islandFlag) {
            continue;
          }

          // DEBUG: b2Assert(stackCount < stackSize);
          stack[stackCount++] = other;
          other.m_islandFlag = true;
        }
      }

      const profile: b2Profile = new b2Profile();
      island.Solve(profile, step, this.m_gravity, this.m_allowSleep);
      this.m_profile.solveInit += profile.solveInit;
      this.m_profile.solveVelocity += profile.solveVelocity;
      this.m_profile.solvePosition += profile.solvePosition;

      // Post solve cleanup.
      for (let i: number = 0; i < island.m_bodyCount; ++i) {
        // Allow static bodies to participate in other islands.
        const b: b2Body = island.m_bodies[i];
        if (b.GetType() === b2BodyType.b2_staticBody) {
          b.m_islandFlag = false;
        }
      }
    }

    for (let i: number = 0; i < stack.length; ++i) {
      if (!stack[i]) {
        break;
      }
      stack[i] = null;
    }

    const timer: b2Timer = new b2Timer();

    // Synchronize fixtures, check for out of range bodies.
    for (let b = this.m_bodyList; b; b = b.m_next) {
      // If a body was not in an island then it did not move.
      if (!b.m_islandFlag) {
        continue;
      }

      if (b.GetType() === b2BodyType.b2_staticBody) {
        continue;
      }

      // Update fixtures (for broad-phase).
      b.SynchronizeFixtures();
    }

    // Look for new contacts.
    this.m_contactManager.FindNewContacts();
    this.m_profile.broadphase = timer.GetMilliseconds();
  }

  private static SolveTOI_s_subStep = new b2TimeStep();
  private static SolveTOI_s_backup = new b2Sweep();
  private static SolveTOI_s_backup1 = new b2Sweep();
  private static SolveTOI_s_backup2 = new b2Sweep();
  private static SolveTOI_s_toi_input = new b2TOIInput();
  private static SolveTOI_s_toi_output = new b2TOIOutput();
  public SolveTOI(step: b2TimeStep): void {
    const island: b2Island = this.m_island;
    island.Initialize(
      2 * b2_maxTOIContacts,
      b2_maxTOIContacts,
      0,
      this.m_contactManager.m_contactListener
    );

    if (this.m_stepComplete) {
      for (let b: b2Body | null = this.m_bodyList; b; b = b.m_next) {
        b.m_islandFlag = false;
        b.m_sweep.alpha0 = 0;
      }

      for (
        let c: b2Contact | null = this.m_contactManager.m_contactList;
        c;
        c = c.m_next
      ) {
        // Invalidate TOI
        c.m_toiFlag = false;
        c.m_islandFlag = false;
        c.m_toiCount = 0;
        c.m_toi = 1;
      }
    }

    // Find TOI events and solve them.
    for (;;) {
      // Find the first TOI.
      let minContact: b2Contact | null = null;
      let minAlpha: number = 1;

      for (
        let c: b2Contact | null = this.m_contactManager.m_contactList;
        c;
        c = c.m_next
      ) {
        // Is this contact disabled?
        if (!c.IsEnabled()) {
          continue;
        }

        // Prevent excessive sub-stepping.
        if (c.m_toiCount > b2_maxSubSteps) {
          continue;
        }

        let alpha: number = 1;
        if (c.m_toiFlag) {
          // This contact has a valid cached TOI.
          alpha = c.m_toi;
        } else {
          const fA: b2Fixture = c.GetFixtureA();
          const fB: b2Fixture = c.GetFixtureB();

          // Is there a sensor?
          if (fA.IsSensor() || fB.IsSensor()) {
            continue;
          }

          const bA: b2Body = fA.GetBody();
          const bB: b2Body = fB.GetBody();

          const typeA: b2BodyType = bA.m_type;
          const typeB: b2BodyType = bB.m_type;
          // DEBUG: b2Assert(typeA !== b2BodyType.b2_staticBody || typeB !== b2BodyType.b2_staticBody);

          const activeA: boolean =
            bA.IsAwake() && typeA !== b2BodyType.b2_staticBody;
          const activeB: boolean =
            bB.IsAwake() && typeB !== b2BodyType.b2_staticBody;

          // Is at least one body active (awake and dynamic or kinematic)?
          if (!activeA && !activeB) {
            continue;
          }

          const collideA: boolean =
            bA.IsBullet() || typeA !== b2BodyType.b2_dynamicBody;
          const collideB: boolean =
            bB.IsBullet() || typeB !== b2BodyType.b2_dynamicBody;

          // Are these two non-bullet dynamic bodies?
          if (!collideA && !collideB) {
            continue;
          }

          // Compute the TOI for this contact.
          // Put the sweeps onto the same time interval.
          let alpha0: number = bA.m_sweep.alpha0;

          if (bA.m_sweep.alpha0 < bB.m_sweep.alpha0) {
            alpha0 = bB.m_sweep.alpha0;
            bA.m_sweep.Advance(alpha0);
          } else if (bB.m_sweep.alpha0 < bA.m_sweep.alpha0) {
            alpha0 = bA.m_sweep.alpha0;
            bB.m_sweep.Advance(alpha0);
          }

          // DEBUG: b2Assert(alpha0 < 1);

          const indexA: number = c.GetChildIndexA();
          const indexB: number = c.GetChildIndexB();

          // Compute the time of impact in interval [0, minTOI]
          const input: b2TOIInput = b2World.SolveTOI_s_toi_input;
          input.proxyA.SetShape(fA.GetShape(), indexA);
          input.proxyB.SetShape(fB.GetShape(), indexB);
          input.sweepA.Copy(bA.m_sweep);
          input.sweepB.Copy(bB.m_sweep);
          input.tMax = 1;

          const output: b2TOIOutput = b2World.SolveTOI_s_toi_output;
          b2TimeOfImpact(output, input);

          // Beta is the fraction of the remaining portion of the .
          const beta: number = output.t;
          if (output.state === b2TOIOutputState.e_touching) {
            alpha = b2Min(alpha0 + (1 - alpha0) * beta, 1);
          } else {
            alpha = 1;
          }

          c.m_toi = alpha;
          c.m_toiFlag = true;
        }

        if (alpha < minAlpha) {
          // This is the minimum TOI found so far.
          minContact = c;
          minAlpha = alpha;
        }
      }

      if (minContact === null || 1 - 10 * b2_epsilon < minAlpha) {
        // No more TOI events. Done!
        this.m_stepComplete = true;
        break;
      }

      // Advance the bodies to the TOI.
      const fA: b2Fixture = minContact.GetFixtureA();
      const fB: b2Fixture = minContact.GetFixtureB();
      const bA: b2Body = fA.GetBody();
      const bB: b2Body = fB.GetBody();

      const backup1: b2Sweep = b2World.SolveTOI_s_backup1.Copy(bA.m_sweep);
      const backup2: b2Sweep = b2World.SolveTOI_s_backup2.Copy(bB.m_sweep);

      bA.Advance(minAlpha);
      bB.Advance(minAlpha);

      // The TOI contact likely has some new contact points.
      minContact.Update(this.m_contactManager.m_contactListener);
      minContact.m_toiFlag = false;
      ++minContact.m_toiCount;

      // Is the contact solid?
      if (!minContact.IsEnabled() || !minContact.IsTouching()) {
        // Restore the sweeps.
        minContact.SetEnabled(false);
        bA.m_sweep.Copy(backup1);
        bB.m_sweep.Copy(backup2);
        bA.SynchronizeTransform();
        bB.SynchronizeTransform();
        continue;
      }

      bA.SetAwake(true);
      bB.SetAwake(true);

      // Build the island
      island.Clear();
      island.AddBody(bA);
      island.AddBody(bB);
      island.AddContact(minContact);

      bA.m_islandFlag = true;
      bB.m_islandFlag = true;
      minContact.m_islandFlag = true;

      // Get contacts on bodyA and bodyB.
      // const bodies: b2Body[] = [bA, bB];
      for (let i: number = 0; i < 2; ++i) {
        const body: b2Body = i === 0 ? bA : bB; // bodies[i];
        if (body.m_type === b2BodyType.b2_dynamicBody) {
          for (
            let ce: b2ContactEdge | null = body.m_contactList;
            ce;
            ce = ce.next
          ) {
            if (island.m_bodyCount === island.m_bodyCapacity) {
              break;
            }

            if (island.m_contactCount === island.m_contactCapacity) {
              break;
            }

            const contact: b2Contact = ce.contact;

            // Has this contact already been added to the island?
            if (contact.m_islandFlag) {
              continue;
            }

            // Only add static, kinematic, or bullet bodies.
            const other: b2Body = ce.other;
            if (
              other.m_type === b2BodyType.b2_dynamicBody &&
              !body.IsBullet() &&
              !other.IsBullet()
            ) {
              continue;
            }

            // Skip sensors.
            const sensorA: boolean = contact.m_fixtureA.m_isSensor;
            const sensorB: boolean = contact.m_fixtureB.m_isSensor;
            if (sensorA || sensorB) {
              continue;
            }

            // Tentatively advance the body to the TOI.
            const backup: b2Sweep = b2World.SolveTOI_s_backup.Copy(
              other.m_sweep
            );
            if (!other.m_islandFlag) {
              other.Advance(minAlpha);
            }

            // Update the contact points
            contact.Update(this.m_contactManager.m_contactListener);

            // Was the contact disabled by the user?
            if (!contact.IsEnabled()) {
              other.m_sweep.Copy(backup);
              other.SynchronizeTransform();
              continue;
            }

            // Are there contact points?
            if (!contact.IsTouching()) {
              other.m_sweep.Copy(backup);
              other.SynchronizeTransform();
              continue;
            }

            // Add the contact to the island
            contact.m_islandFlag = true;
            island.AddContact(contact);

            // Has the other body already been added to the island?
            if (other.m_islandFlag) {
              continue;
            }

            // Add the other body to the island.
            other.m_islandFlag = true;

            if (other.m_type !== b2BodyType.b2_staticBody) {
              other.SetAwake(true);
            }

            island.AddBody(other);
          }
        }
      }

      const subStep: b2TimeStep = b2World.SolveTOI_s_subStep;
      subStep.dt = (1 - minAlpha) * step.dt;
      subStep.inv_dt = 1 / subStep.dt;
      subStep.dtRatio = 1;
      subStep.positionIterations = 20;
      subStep.velocityIterations = step.velocityIterations;
      // #if B2_ENABLE_PARTICLE
      subStep.particleIterations = step.particleIterations;
      // #endif
      subStep.warmStarting = false;
      island.SolveTOI(subStep, bA.m_islandIndex, bB.m_islandIndex);

      // Reset island flags and synchronize broad-phase proxies.
      for (let i: number = 0; i < island.m_bodyCount; ++i) {
        const body: b2Body = island.m_bodies[i];
        body.m_islandFlag = false;

        if (body.m_type !== b2BodyType.b2_dynamicBody) {
          continue;
        }

        body.SynchronizeFixtures();

        // Invalidate all contact TOIs on this displaced body.
        for (
          let ce: b2ContactEdge | null = body.m_contactList;
          ce;
          ce = ce.next
        ) {
          ce.contact.m_toiFlag = false;
          ce.contact.m_islandFlag = false;
        }
      }

      // Commit fixture proxy movements to the broad-phase so that new contacts are created.
      // Also, some contacts can be destroyed.
      this.m_contactManager.FindNewContacts();

      if (this.m_subStepping) {
        this.m_stepComplete = false;
        break;
      }
    }
  }

  // #if B2_ENABLE_CONTROLLER
  public AddController(controller: b2Controller): b2Controller {
    // b2Assert(controller.m_world === null, "Controller can only be a member of one world");
    // controller.m_world = this;
    controller.m_next = this.m_controllerList;
    controller.m_prev = null;
    if (this.m_controllerList) {
      this.m_controllerList.m_prev = controller;
    }
    this.m_controllerList = controller;
    ++this.m_controllerCount;
    return controller;
  }

  public RemoveController(controller: b2Controller): b2Controller {
    // b2Assert(controller.m_world === this, "Controller is not a member of this world");
    if (controller.m_prev) {
      controller.m_prev.m_next = controller.m_next;
    }
    if (controller.m_next) {
      controller.m_next.m_prev = controller.m_prev;
    }
    if (this.m_controllerList === controller) {
      this.m_controllerList = controller.m_next;
    }
    --this.m_controllerCount;
    controller.m_prev = null;
    controller.m_next = null;
    // delete controller.m_world; // = null;
    return controller;
  }
  // #endif
}
