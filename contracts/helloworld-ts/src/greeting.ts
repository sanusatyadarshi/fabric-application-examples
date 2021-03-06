
/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Object, Property } from 'fabric-contract-api';

@Object('Greeting')
export default class Greeting {

    public static validate(greeting: Greeting) {
        const text = greeting.text;

        if (text.length !== greeting.textLength) {
            throw new Error('Length incorrectly set');
        }

        if (text.split(' ').length !== greeting.wordCount) {
            throw new Error('Word count incorrectly set');
        }

    }

    @Property('text')
    private text: string;

    @Property('length')
    private textLength: number;

    @Property('wordcount')
    private wordCount: number;

    constructor(text: string) {
        this.text = text;
        this.textLength = text.length;
        this.wordCount = text.split(' ').length;
    }

    public setText(text: string): void {
        this.text = text;
    }

    public getText(): string {
        return this.text;
    }

}
